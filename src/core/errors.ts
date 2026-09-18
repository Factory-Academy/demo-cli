// Typed domain errors.
//
// The core throws these instead of calling console.error / process.exit, so it
// stays pure and testable. Adapters decide how to surface them (see
// commands/output.ts). Each error carries structured fields in addition to a
// human-readable message.

export class NotFoundError extends Error {
  constructor(
    public readonly resource: string,
    public readonly id: string,
  ) {
    super(`${resource} ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
