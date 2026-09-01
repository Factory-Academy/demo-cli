/**
 * Schema-lite validation module for input validation.
 * Provides a lightweight, composable approach to validating user input.
 */

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export type ValidatorFn = (value: any, field: string) => ValidationError | null

/**
 * String validator builder with common validation rules.
 */
export class StringValidator {
  private validators: ValidatorFn[] = []

  required(message?: string): this {
    this.validators.push((value, field) => {
      if (value === undefined || value === null || String(value).trim() === '') {
        return {
          field,
          message: message || `${field} is required`
        }
      }
      return null
    })
    return this
  }

  minLength(min: number, message?: string): this {
    this.validators.push((value, field) => {
      if (value !== undefined && value !== null && String(value).length < min) {
        return {
          field,
          message: message || `${field} must be at least ${min} characters`
        }
      }
      return null
    })
    return this
  }

  maxLength(max: number, message?: string): this {
    this.validators.push((value, field) => {
      if (value !== undefined && value !== null && String(value).length > max) {
        return {
          field,
          message: message || `${field} must not exceed ${max} characters`
        }
      }
      return null
    })
    return this
  }

  pattern(regex: RegExp, message?: string): this {
    this.validators.push((value, field) => {
      if (value !== undefined && value !== null && !regex.test(String(value))) {
        return {
          field,
          message: message || `${field} format is invalid`
        }
      }
      return null
    })
    return this
  }

  build(): ValidatorFn {
    return (value, field) => {
      for (const validator of this.validators) {
        const error = validator(value, field)
        if (error) return error
      }
      return null
    }
  }
}

/**
 * Number validator builder with common validation rules.
 */
export class NumberValidator {
  private validators: ValidatorFn[] = []

  required(message?: string): this {
    this.validators.push((value, field) => {
      if (value === undefined || value === null || value === '') {
        return {
          field,
          message: message || `${field} is required`
        }
      }
      return null
    })
    return this
  }

  min(min: number, message?: string): this {
    this.validators.push((value, field) => {
      const num = Number(value)
      if (!isNaN(num) && num < min) {
        return {
          field,
          message: message || `${field} must be at least ${min}`
        }
      }
      return null
    })
    return this
  }

  max(max: number, message?: string): this {
    this.validators.push((value, field) => {
      const num = Number(value)
      if (!isNaN(num) && num > max) {
        return {
          field,
          message: message || `${field} must not exceed ${max}`
        }
      }
      return null
    })
    return this
  }

  integer(message?: string): this {
    this.validators.push((value, field) => {
      const num = Number(value)
      if (!isNaN(num) && !Number.isInteger(num)) {
        return {
          field,
          message: message || `${field} must be an integer`
        }
      }
      return null
    })
    return this
  }

  build(): ValidatorFn {
    return (value, field) => {
      for (const validator of this.validators) {
        const error = validator(value, field)
        if (error) return error
      }
      return null
    }
  }
}

/**
 * Schema validator for validating objects against a field schema.
 */
export class SchemaValidator {
  private schema: Record<string, ValidatorFn> = {}

  field(name: string, validator: ValidatorFn): this {
    this.schema[name] = validator
    return this
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = []

    for (const [field, validator] of Object.entries(this.schema)) {
      const error = validator(data[field], field)
      if (error) {
        errors.push(error)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * Convenience function to create a string validator.
 */
export function string(): StringValidator {
  return new StringValidator()
}

/**
 * Convenience function to create a number validator.
 */
export function number(): NumberValidator {
  return new NumberValidator()
}

/**
 * Convenience function to create a schema validator.
 */
export function schema(): SchemaValidator {
  return new SchemaValidator()
}
