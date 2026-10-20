/**
 * Generic asynchronous finite state machine.
 *
 * The machine owns a single `current` state and advances it only through
 * declared transitions. Every advance is async because a real transition
 * usually has to run a guard and persist a side effect before the new state
 * can be trusted. Centralizing that here removes the ad-hoc, inconsistent
 * status mutation that used to live at each call site.
 */

/**
 * Declares which target state each event leads to, per source state.
 * A missing source state or missing event means "no transition".
 */
export type TransitionMap<S extends string, E extends string> = {
  readonly [from in S]?: {
    readonly [event in E]?: S
  }
}

/** A single recorded transition, used for auditing and debugging. */
export interface TransitionRecord<S extends string, E extends string> {
  readonly from: S
  readonly to: S
  readonly event: E
  /** ISO-8601 timestamp of when the transition was applied. */
  readonly at: string
}

/** Context passed to guards and hooks for an attempted transition. */
export interface TransitionContext<S extends string, E extends string> {
  readonly from: S
  readonly to: S
  readonly event: E
}

/**
 * A guard may veto a transition by returning `false` (or resolving to it).
 * Throwing from a guard is also treated as a veto and the error propagates.
 */
export type Guard<S extends string, E extends string> = (
  ctx: TransitionContext<S, E>,
) => boolean | Promise<boolean>

/** Side effect run after a transition is committed (e.g. persistence). */
export type TransitionHook<S extends string, E extends string> = (
  record: TransitionRecord<S, E>,
) => void | Promise<void>

export interface StateMachineOptions<S extends string, E extends string> {
  /** State the machine starts in. May be any state, including a terminal one. */
  readonly initial: S
  readonly transitions: TransitionMap<S, E>
  /** Optional guard evaluated before every transition. */
  readonly guard?: Guard<S, E>
  /** Optional hook run after every committed transition. */
  readonly onTransition?: TransitionHook<S, E>
}

/** Raised when an event is not valid from the current state. */
export class InvalidTransitionError<
  S extends string,
  E extends string,
> extends Error {
  constructor(
    readonly from: S,
    readonly event: E,
    readonly available: readonly E[],
  ) {
    const choices = available.length > 0 ? available.join(', ') : '(none)'
    super(
      `Cannot apply event "${event}" from state "${from}". ` +
        `Available events: ${choices}.`,
    )
    this.name = 'InvalidTransitionError'
    // Preserve prototype chain when compiled to ES5-style targets.
    Object.setPrototypeOf(this, InvalidTransitionError.prototype)
  }
}

/** Raised when a guard vetoes an otherwise-declared transition. */
export class GuardRejectedError<
  S extends string,
  E extends string,
> extends Error {
  constructor(
    readonly from: S,
    readonly to: S,
    readonly event: E,
  ) {
    super(
      `Transition "${from}" -> "${to}" on event "${event}" ` +
        `was rejected by a guard.`,
    )
    this.name = 'GuardRejectedError'
    Object.setPrototypeOf(this, GuardRejectedError.prototype)
  }
}

export class StateMachine<S extends string, E extends string> {
  private current: S
  private readonly transitions: TransitionMap<S, E>
  private readonly guard?: Guard<S, E>
  private readonly onTransition?: TransitionHook<S, E>
  private readonly history: TransitionRecord<S, E>[] = []
  private readonly initial: S
  /** Guards against overlapping async transitions on one machine instance. */
  private pending = false

  constructor(options: StateMachineOptions<S, E>) {
    this.initial = options.initial
    this.current = options.initial
    this.transitions = options.transitions
    this.guard = options.guard
    this.onTransition = options.onTransition
  }

  /** The current state. */
  get state(): S {
    return this.current
  }

  /** Immutable copy of the transition history, oldest first. */
  get log(): readonly TransitionRecord<S, E>[] {
    return [...this.history]
  }

  /** The target state for `event` from the current state, or undefined. */
  target(event: E): S | undefined {
    return this.transitions[this.current]?.[event]
  }

  /** Whether `event` is a declared transition from the current state. */
  can(event: E): boolean {
    return this.target(event) !== undefined
  }

  /** Events that are declared from the current state, in declaration order. */
  availableEvents(): E[] {
    const fromCurrent = this.transitions[this.current]
    if (!fromCurrent) return []
    return (Object.keys(fromCurrent) as E[]).filter(
      event => fromCurrent[event] !== undefined,
    )
  }

  /** A terminal state has no outgoing transitions. */
  isTerminal(): boolean {
    return this.availableEvents().length === 0
  }

  /**
   * Apply `event` asynchronously.
   *
   * Order of operations: validate the transition exists, run the guard,
   * commit the new state, record history, then run the post-transition hook.
   * The state is only mutated once the guard has passed, so a rejected or
   * failing guard leaves the machine exactly as it was.
   */
  async send(event: E): Promise<TransitionRecord<S, E>> {
    if (this.pending) {
      throw new Error(
        'A transition is already in progress on this state machine.',
      )
    }

    const to = this.target(event)
    if (to === undefined) {
      throw new InvalidTransitionError(
        this.current,
        event,
        this.availableEvents(),
      )
    }

    const from = this.current
    const ctx: TransitionContext<S, E> = { from, to, event }

    this.pending = true
    try {
      if (this.guard) {
        const allowed = await this.guard(ctx)
        if (!allowed) {
          throw new GuardRejectedError(from, to, event)
        }
      }

      this.current = to
      const record: TransitionRecord<S, E> = {
        from,
        to,
        event,
        at: new Date().toISOString(),
      }
      this.history.push(record)

      if (this.onTransition) {
        await this.onTransition(record)
      }

      return record
    } finally {
      this.pending = false
    }
  }

  /** Reset to the initial state and clear history. */
  reset(): void {
    this.current = this.initial
    this.history.length = 0
    this.pending = false
  }
}
