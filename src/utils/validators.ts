export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ValidatorRule {
  type?: 'string' | 'number' | 'boolean'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface Schema {
  [field: string]: ValidatorRule
}

/**
 * Validates a value against a single rule
 */
function validateField(
  fieldName: string,
  value: any,
  rule: ValidatorRule
): string[] {
  const errors: string[] = []

  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`)
    return errors
  }

  // If not required and empty, skip other validations
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return errors
  }

  // Check type
  if (rule.type) {
    const actualType = typeof value
    if (rule.type === 'number') {
      const num = Number(value)
      if (isNaN(num)) {
        errors.push(`${fieldName} must be a valid number`)
        return errors
      }
      value = num
    } else if (actualType !== rule.type) {
      errors.push(`${fieldName} must be a ${rule.type}`)
      return errors
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      errors.push(`${fieldName} must be at least ${rule.minLength} characters`)
    }
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      errors.push(`${fieldName} must be at most ${rule.maxLength} characters`)
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${fieldName} has an invalid format`)
    }
  }

  // Number validations
  if (typeof value === 'number' || rule.type === 'number') {
    const num = typeof value === 'number' ? value : Number(value)
    if (rule.min !== undefined && num < rule.min) {
      errors.push(`${fieldName} must be at least ${rule.min}`)
    }
    if (rule.max !== undefined && num > rule.max) {
      errors.push(`${fieldName} must be at most ${rule.max}`)
    }
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value)
    if (customError) {
      errors.push(customError)
    }
  }

  return errors
}

/**
 * Validates an object against a schema
 */
export function validate(data: Record<string, any>, schema: Schema): ValidationResult {
  const errors: string[] = []

  for (const [fieldName, rule] of Object.entries(schema)) {
    const value = data[fieldName]
    const fieldErrors = validateField(fieldName, value, rule)
    errors.push(...fieldErrors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validates and throws if invalid
 */
export function validateOrThrow(data: Record<string, any>, schema: Schema): void {
  const result = validate(data, schema)
  if (!result.valid) {
    throw new Error(`Validation failed:\n${result.errors.map(e => `  - ${e}`).join('\n')}`)
  }
}
