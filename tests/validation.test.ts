import {
  string,
  number,
  schema,
  StringValidator,
  NumberValidator,
  SchemaValidator,
  ValidationError
} from '../src/utils/validation'

describe('StringValidator', () => {
  describe('required', () => {
    test('rejects undefined value', () => {
      const validator = string().required().build()
      const error = validator(undefined, 'name')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('name is required')
    })

    test('rejects null value', () => {
      const validator = string().required().build()
      const error = validator(null, 'name')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('name is required')
    })

    test('rejects empty string', () => {
      const validator = string().required().build()
      const error = validator('', 'name')
      expect(error).not.toBeNull()
    })

    test('rejects whitespace-only string', () => {
      const validator = string().required().build()
      const error = validator('   ', 'name')
      expect(error).not.toBeNull()
    })

    test('accepts non-empty string', () => {
      const validator = string().required().build()
      const error = validator('test', 'name')
      expect(error).toBeNull()
    })

    test('uses custom error message', () => {
      const validator = string().required('Custom required message').build()
      const error = validator('', 'name')
      expect(error?.message).toBe('Custom required message')
    })
  })

  describe('minLength', () => {
    test('rejects string shorter than minimum', () => {
      const validator = string().minLength(5).build()
      const error = validator('test', 'name')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('at least 5')
    })

    test('accepts string equal to minimum', () => {
      const validator = string().minLength(4).build()
      const error = validator('test', 'name')
      expect(error).toBeNull()
    })

    test('accepts string longer than minimum', () => {
      const validator = string().minLength(3).build()
      const error = validator('test', 'name')
      expect(error).toBeNull()
    })

    test('skips validation for undefined', () => {
      const validator = string().minLength(5).build()
      const error = validator(undefined, 'name')
      expect(error).toBeNull()
    })

    test('uses custom error message', () => {
      const validator = string().minLength(5, 'Too short!').build()
      const error = validator('abc', 'name')
      expect(error?.message).toBe('Too short!')
    })
  })

  describe('maxLength', () => {
    test('rejects string longer than maximum', () => {
      const validator = string().maxLength(5).build()
      const error = validator('testing', 'name')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('not exceed 5')
    })

    test('accepts string equal to maximum', () => {
      const validator = string().maxLength(4).build()
      const error = validator('test', 'name')
      expect(error).toBeNull()
    })

    test('accepts string shorter than maximum', () => {
      const validator = string().maxLength(10).build()
      const error = validator('test', 'name')
      expect(error).toBeNull()
    })

    test('uses custom error message', () => {
      const validator = string().maxLength(3, 'Too long!').build()
      const error = validator('test', 'name')
      expect(error?.message).toBe('Too long!')
    })
  })

  describe('pattern', () => {
    test('rejects string not matching pattern', () => {
      const validator = string().pattern(/^[a-z]+$/).build()
      const error = validator('Test123', 'name')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('format is invalid')
    })

    test('accepts string matching pattern', () => {
      const validator = string().pattern(/^[a-z]+$/).build()
      const error = validator('test', 'name')
      expect(error).toBeNull()
    })

    test('skips validation for undefined', () => {
      const validator = string().pattern(/^[a-z]+$/).build()
      const error = validator(undefined, 'name')
      expect(error).toBeNull()
    })

    test('uses custom error message', () => {
      const validator = string().pattern(/^[0-9]+$/, 'Must be digits only').build()
      const error = validator('abc', 'code')
      expect(error?.message).toBe('Must be digits only')
    })
  })

  describe('chained validators', () => {
    test('applies multiple validators in sequence', () => {
      const validator = string()
        .required()
        .minLength(3)
        .maxLength(10)
        .pattern(/^[a-z]+$/)
        .build()

      expect(validator('', 'name')).not.toBeNull()
      expect(validator('ab', 'name')).not.toBeNull()
      expect(validator('verylongstring', 'name')).not.toBeNull()
      expect(validator('Test', 'name')).not.toBeNull()
      expect(validator('test', 'name')).toBeNull()
    })

    test('returns first error when multiple fail', () => {
      const validator = string()
        .required()
        .minLength(5)
        .build()

      const error = validator('', 'name')
      expect(error?.message).toContain('required')
    })
  })
})

describe('NumberValidator', () => {
  describe('required', () => {
    test('rejects undefined value', () => {
      const validator = number().required().build()
      const error = validator(undefined, 'age')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('age is required')
    })

    test('rejects null value', () => {
      const validator = number().required().build()
      const error = validator(null, 'age')
      expect(error).not.toBeNull()
    })

    test('rejects empty string', () => {
      const validator = number().required().build()
      const error = validator('', 'age')
      expect(error).not.toBeNull()
    })

    test('accepts number value', () => {
      const validator = number().required().build()
      const error = validator(5, 'age')
      expect(error).toBeNull()
    })

    test('accepts zero', () => {
      const validator = number().required().build()
      const error = validator(0, 'age')
      expect(error).toBeNull()
    })
  })

  describe('min', () => {
    test('rejects number less than minimum', () => {
      const validator = number().min(10).build()
      const error = validator(5, 'age')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('at least 10')
    })

    test('accepts number equal to minimum', () => {
      const validator = number().min(10).build()
      const error = validator(10, 'age')
      expect(error).toBeNull()
    })

    test('accepts number greater than minimum', () => {
      const validator = number().min(10).build()
      const error = validator(15, 'age')
      expect(error).toBeNull()
    })

    test('works with string numbers', () => {
      const validator = number().min(10).build()
      expect(validator('5', 'age')).not.toBeNull()
      expect(validator('15', 'age')).toBeNull()
    })

    test('uses custom error message', () => {
      const validator = number().min(10, 'Too small!').build()
      const error = validator(5, 'age')
      expect(error?.message).toBe('Too small!')
    })
  })

  describe('max', () => {
    test('rejects number greater than maximum', () => {
      const validator = number().max(100).build()
      const error = validator(150, 'age')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('not exceed 100')
    })

    test('accepts number equal to maximum', () => {
      const validator = number().max(100).build()
      const error = validator(100, 'age')
      expect(error).toBeNull()
    })

    test('accepts number less than maximum', () => {
      const validator = number().max(100).build()
      const error = validator(50, 'age')
      expect(error).toBeNull()
    })

    test('uses custom error message', () => {
      const validator = number().max(100, 'Too large!').build()
      const error = validator(150, 'age')
      expect(error?.message).toBe('Too large!')
    })
  })

  describe('integer', () => {
    test('rejects decimal numbers', () => {
      const validator = number().integer().build()
      const error = validator(5.5, 'count')
      expect(error).not.toBeNull()
      expect(error?.message).toContain('must be an integer')
    })

    test('accepts integer numbers', () => {
      const validator = number().integer().build()
      const error = validator(5, 'count')
      expect(error).toBeNull()
    })

    test('accepts zero', () => {
      const validator = number().integer().build()
      const error = validator(0, 'count')
      expect(error).toBeNull()
    })

    test('accepts negative integers', () => {
      const validator = number().integer().build()
      const error = validator(-5, 'count')
      expect(error).toBeNull()
    })

    test('uses custom error message', () => {
      const validator = number().integer('Must be whole number').build()
      const error = validator(5.5, 'count')
      expect(error?.message).toBe('Must be whole number')
    })
  })

  describe('chained validators', () => {
    test('applies multiple validators in sequence', () => {
      const validator = number()
        .required()
        .min(1)
        .max(100)
        .integer()
        .build()

      expect(validator(undefined, 'age')).not.toBeNull()
      expect(validator(0, 'age')).not.toBeNull()
      expect(validator(150, 'age')).not.toBeNull()
      expect(validator(50.5, 'age')).not.toBeNull()
      expect(validator(50, 'age')).toBeNull()
    })
  })
})

describe('SchemaValidator', () => {
  test('validates all fields in schema', () => {
    const validator = schema()
      .field('name', string().required().minLength(3).build())
      .field('age', number().required().min(0).build())

    const result = validator.validate({
      name: 'John',
      age: 25
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('collects errors from multiple fields', () => {
    const validator = schema()
      .field('name', string().required().build())
      .field('age', number().required().build())

    const result = validator.validate({
      name: '',
      age: undefined
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(2)
    expect(result.errors[0].field).toBe('name')
    expect(result.errors[1].field).toBe('age')
  })

  test('validates partial schemas with optional fields', () => {
    const validator = schema()
      .field('name', string().required().build())
      .field('description', string().maxLength(100).build())

    const result = validator.validate({
      name: 'Test'
      // description is optional (not provided)
    })

    expect(result.valid).toBe(true)
  })

  test('validates complex real-world schema', () => {
    const validator = schema()
      .field('username', string().required().minLength(3).maxLength(20).pattern(/^[a-z0-9_]+$/).build())
      .field('email', string().required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).build())
      .field('age', number().min(18).max(120).integer().build())

    const validData = {
      username: 'john_doe',
      email: 'john@example.com',
      age: 25
    }

    const invalidData = {
      username: 'ab',
      email: 'invalid-email',
      age: 150
    }

    expect(validator.validate(validData).valid).toBe(true)
    expect(validator.validate(invalidData).valid).toBe(false)
    expect(validator.validate(invalidData).errors.length).toBeGreaterThan(0)
  })

  test('handles missing fields in data', () => {
    const validator = schema()
      .field('name', string().required().build())

    const result = validator.validate({})

    expect(result.valid).toBe(false)
    expect(result.errors[0].field).toBe('name')
  })
})

describe('convenience functions', () => {
  test('string() returns StringValidator instance', () => {
    const validator = string()
    expect(validator).toBeInstanceOf(StringValidator)
  })

  test('number() returns NumberValidator instance', () => {
    const validator = number()
    expect(validator).toBeInstanceOf(NumberValidator)
  })

  test('schema() returns SchemaValidator instance', () => {
    const validator = schema()
    expect(validator).toBeInstanceOf(SchemaValidator)
  })
})
