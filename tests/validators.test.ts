import { validate, validateOrThrow } from '../src/utils/validators'

describe('validators', () => {
  describe('validate', () => {
    test('validates required fields', () => {
      const result = validate({ name: '' }, { name: { required: true } })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('name is required')
    })

    test('passes when required field is present', () => {
      const result = validate({ name: 'test' }, { name: { required: true } })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('validates string type', () => {
      const result = validate({ name: 123 }, { name: { type: 'string' } })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('name must be a string')
    })

    test('validates number type', () => {
      const result = validate({ age: 'abc' }, { age: { type: 'number' } })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('age must be a valid number')
    })

    test('coerces valid numeric strings', () => {
      const result = validate({ age: '25' }, { age: { type: 'number', min: 0, max: 100 } })
      expect(result.valid).toBe(true)
    })

    test('validates string minLength', () => {
      const result = validate({ name: 'ab' }, { name: { type: 'string', minLength: 3 } })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('name must be at least 3 characters')
    })

    test('validates string maxLength', () => {
      const result = validate({ name: 'abcdef' }, { name: { type: 'string', maxLength: 5 } })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('name must be at most 5 characters')
    })

    test('validates string pattern', () => {
      const result = validate(
        { email: 'invalid' },
        { email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ } }
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('email has an invalid format')
    })

    test('passes valid string pattern', () => {
      const result = validate(
        { email: 'test@example.com' },
        { email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ } }
      )
      expect(result.valid).toBe(true)
    })

    test('validates number min', () => {
      const result = validate({ age: 5 }, { age: { type: 'number', min: 18 } })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('age must be at least 18')
    })

    test('validates number max', () => {
      const result = validate({ age: 150 }, { age: { type: 'number', max: 120 } })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('age must be at most 120')
    })

    test('validates with custom validator', () => {
      const result = validate(
        { password: 'weak' },
        {
          password: {
            custom: (value) => {
              if (value.length < 8) return 'Password must be at least 8 characters'
              if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter'
              return null
            },
          },
        }
      )
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Password must be at least 8 characters')
    })

    test('passes custom validator', () => {
      const result = validate(
        { password: 'StrongPass123' },
        {
          password: {
            custom: (value) => {
              if (value.length < 8) return 'Password must be at least 8 characters'
              if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter'
              return null
            },
          },
        }
      )
      expect(result.valid).toBe(true)
    })

    test('validates multiple fields', () => {
      const result = validate(
        { name: '', age: -5 },
        {
          name: { required: true },
          age: { type: 'number', min: 0 },
        }
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('name is required')
      expect(result.errors).toContain('age must be at least 0')
    })

    test('handles optional fields correctly', () => {
      const result = validate(
        { name: 'test' },
        {
          name: { required: true },
          description: { type: 'string', minLength: 10 },
        }
      )
      expect(result.valid).toBe(true)
    })

    test('validates optional field when provided', () => {
      const result = validate(
        { name: 'test', description: 'short' },
        {
          name: { required: true },
          description: { type: 'string', minLength: 10 },
        }
      )
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('description must be at least 10 characters')
    })
  })

  describe('validateOrThrow', () => {
    test('throws error on validation failure', () => {
      expect(() => {
        validateOrThrow({ name: '' }, { name: { required: true } })
      }).toThrow('Validation failed')
    })

    test('does not throw on valid data', () => {
      expect(() => {
        validateOrThrow({ name: 'test' }, { name: { required: true } })
      }).not.toThrow()
    })

    test('includes all errors in thrown message', () => {
      try {
        validateOrThrow(
          { name: '', age: -1 },
          {
            name: { required: true },
            age: { type: 'number', min: 0 },
          }
        )
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        const message = (error as Error).message
        expect(message).toContain('name is required')
        expect(message).toContain('age must be at least 0')
      }
    })
  })
})
