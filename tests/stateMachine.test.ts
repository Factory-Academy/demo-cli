import {
  GuardRejectedError,
  InvalidTransitionError,
  StateMachine,
  TransitionMap,
} from '../src/workflow/stateMachine'

// A small, self-contained door machine used to exercise the generic core.
type DoorState = 'open' | 'closed' | 'locked'
type DoorEvent = 'open' | 'close' | 'lock' | 'unlock'

const doorTransitions: TransitionMap<DoorState, DoorEvent> = {
  open: { close: 'closed' },
  closed: { open: 'open', lock: 'locked' },
  locked: { unlock: 'closed' },
}

function makeDoor(initial: DoorState = 'closed') {
  return new StateMachine<DoorState, DoorEvent>({
    initial,
    transitions: doorTransitions,
  })
}

describe('StateMachine', () => {
  describe('construction', () => {
    test('starts in the initial state', () => {
      expect(makeDoor('open').state).toBe('open')
      expect(makeDoor('locked').state).toBe('locked')
    })

    test('starts with an empty history', () => {
      expect(makeDoor().log).toEqual([])
    })
  })

  describe('inspection', () => {
    test('target returns the destination for a valid event', () => {
      expect(makeDoor('closed').target('open')).toBe('open')
      expect(makeDoor('closed').target('lock')).toBe('locked')
    })

    test('target returns undefined for an invalid event', () => {
      expect(makeDoor('closed').target('unlock')).toBeUndefined()
    })

    test('can reflects whether an event is valid', () => {
      const door = makeDoor('closed')
      expect(door.can('open')).toBe(true)
      expect(door.can('unlock')).toBe(false)
    })

    test('availableEvents lists only declared events', () => {
      expect(makeDoor('closed').availableEvents().sort()).toEqual([
        'lock',
        'open',
      ])
      expect(makeDoor('open').availableEvents()).toEqual(['close'])
    })

    test('isTerminal is false when events remain', () => {
      expect(makeDoor('closed').isTerminal()).toBe(false)
    })

    test('isTerminal is true for a state with no outgoing events', () => {
      const trap = new StateMachine<'a' | 'b', 'go'>({
        initial: 'b',
        transitions: { a: { go: 'b' }, b: {} },
      })
      expect(trap.isTerminal()).toBe(true)
    })
  })

  describe('send', () => {
    test('advances the state on a valid event', async () => {
      const door = makeDoor('closed')
      const record = await door.send('open')
      expect(door.state).toBe('open')
      expect(record).toMatchObject({ from: 'closed', to: 'open', event: 'open' })
      expect(typeof record.at).toBe('string')
    })

    test('records each transition in history', async () => {
      const door = makeDoor('closed')
      await door.send('open')
      await door.send('close')
      await door.send('lock')
      expect(door.log.map(r => r.to)).toEqual(['open', 'closed', 'locked'])
    })

    test('log returns a copy that cannot mutate internal history', async () => {
      const door = makeDoor('closed')
      await door.send('open')
      const snapshot = door.log as unknown as unknown[]
      snapshot.push({ bogus: true })
      expect(door.log).toHaveLength(1)
    })

    test('throws InvalidTransitionError for an undeclared event', async () => {
      const door = makeDoor('closed')
      await expect(door.send('unlock')).rejects.toBeInstanceOf(
        InvalidTransitionError,
      )
      // State is unchanged after a rejected event.
      expect(door.state).toBe('closed')
      expect(door.log).toEqual([])
    })

    test('InvalidTransitionError reports the available events', async () => {
      const door = makeDoor('closed')
      try {
        await door.send('unlock')
        fail('expected InvalidTransitionError')
      } catch (err) {
        const e = err as InvalidTransitionError<DoorState, DoorEvent>
        expect(e.from).toBe('closed')
        expect(e.event).toBe('unlock')
        expect([...e.available].sort()).toEqual(['lock', 'open'])
      }
    })
  })

  describe('guards', () => {
    test('a guard returning false vetoes the transition', async () => {
      const machine = new StateMachine<DoorState, DoorEvent>({
        initial: 'closed',
        transitions: doorTransitions,
        guard: () => false,
      })
      await expect(machine.send('open')).rejects.toBeInstanceOf(
        GuardRejectedError,
      )
      expect(machine.state).toBe('closed')
      expect(machine.log).toEqual([])
    })

    test('an async guard is awaited', async () => {
      const machine = new StateMachine<DoorState, DoorEvent>({
        initial: 'closed',
        transitions: doorTransitions,
        guard: async ctx => ctx.event !== 'lock',
      })
      await expect(machine.send('lock')).rejects.toBeInstanceOf(
        GuardRejectedError,
      )
      await expect(machine.send('open')).resolves.toMatchObject({ to: 'open' })
    })

    test('a throwing guard propagates and leaves state unchanged', async () => {
      const boom = new Error('guard exploded')
      const machine = new StateMachine<DoorState, DoorEvent>({
        initial: 'closed',
        transitions: doorTransitions,
        guard: () => {
          throw boom
        },
      })
      await expect(machine.send('open')).rejects.toBe(boom)
      expect(machine.state).toBe('closed')
    })

    test('guard receives the transition context', async () => {
      const seen: unknown[] = []
      const machine = new StateMachine<DoorState, DoorEvent>({
        initial: 'closed',
        transitions: doorTransitions,
        guard: ctx => {
          seen.push(ctx)
          return true
        },
      })
      await machine.send('lock')
      expect(seen).toEqual([{ from: 'closed', to: 'locked', event: 'lock' }])
    })
  })

  describe('onTransition hook', () => {
    test('runs after a committed transition with the record', async () => {
      const calls: string[] = []
      const machine = new StateMachine<DoorState, DoorEvent>({
        initial: 'closed',
        transitions: doorTransitions,
        onTransition: async record => {
          calls.push(`${record.from}->${record.to}`)
        },
      })
      await machine.send('open')
      expect(calls).toEqual(['closed->open'])
      // State is already committed when the hook runs.
      expect(machine.state).toBe('open')
    })

    test('does not run when the transition is invalid', async () => {
      const hook = jest.fn()
      const machine = new StateMachine<DoorState, DoorEvent>({
        initial: 'closed',
        transitions: doorTransitions,
        onTransition: hook,
      })
      await expect(machine.send('unlock')).rejects.toThrow()
      expect(hook).not.toHaveBeenCalled()
    })
  })

  describe('concurrency guard', () => {
    test('rejects an overlapping send while one is in progress', async () => {
      let release: () => void = () => undefined
      const gate = new Promise<void>(resolve => {
        release = resolve
      })
      const machine = new StateMachine<DoorState, DoorEvent>({
        initial: 'closed',
        transitions: doorTransitions,
        guard: async () => {
          await gate
          return true
        },
      })

      const first = machine.send('open')
      await expect(machine.send('lock')).rejects.toThrow(/already in progress/)
      release()
      await expect(first).resolves.toMatchObject({ to: 'open' })
    })

    test('allows a new send once the previous one settles', async () => {
      const machine = makeDoor('closed')
      await machine.send('open')
      await expect(machine.send('close')).resolves.toMatchObject({
        to: 'closed',
      })
    })
  })

  describe('reset', () => {
    test('returns to the initial state and clears history', async () => {
      const door = makeDoor('closed')
      await door.send('open')
      await door.send('close')
      door.reset()
      expect(door.state).toBe('closed')
      expect(door.log).toEqual([])
      // Still usable after reset.
      await expect(door.send('open')).resolves.toMatchObject({ to: 'open' })
    })
  })
})
