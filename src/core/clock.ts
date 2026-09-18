// A tiny time abstraction.
//
// The original code called `new Date().toISOString()` directly inside the
// command handler, which made the output impossible to assert in a test
// without freezing global time. Injecting a Clock keeps the core deterministic:
// production uses `systemClock`, tests pass a fixed one.

export interface Clock {
  now(): Date
}

export const systemClock: Clock = {
  now: () => new Date(),
}

/** Returns a Clock that always reports the same instant. Handy in tests. */
export function fixedClock(instant: string | Date): Clock {
  const value = instant instanceof Date ? instant : new Date(instant)
  return { now: () => value }
}
