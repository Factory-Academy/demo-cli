import { schema, string } from '../src/utils/validation'

/**
 * Integration tests demonstrating the validation module
 * applied to the item command's create action.
 */

describe('Item creation validation', () => {
  const createItemValidator = () =>
    schema()
      .field('name', string().required().minLength(3).maxLength(50).build())
      .field('description', string().maxLength(200).build())

  describe('valid inputs', () => {
    test('accepts valid name and description', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'Test Item',
        description: 'A test item description'
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('accepts valid name without description', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'Test Item'
      })

      expect(result.valid).toBe(true)
    })

    test('accepts name at minimum length', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'ABC'
      })

      expect(result.valid).toBe(true)
    })

    test('accepts name at maximum length', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'A'.repeat(50)
      })

      expect(result.valid).toBe(true)
    })

    test('accepts description at maximum length', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'Test',
        description: 'X'.repeat(200)
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    test('rejects missing name', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        description: 'Description without name'
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('name')
      expect(result.errors[0].message).toContain('required')
    })

    test('rejects empty name', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: ''
      })

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('required')
    })

    test('rejects whitespace-only name', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: '   '
      })

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('required')
    })

    test('rejects name shorter than 3 characters', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'AB'
      })

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('at least 3')
    })

    test('rejects name longer than 50 characters', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'A'.repeat(51)
      })

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('not exceed 50')
    })

    test('rejects description longer than 200 characters', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'Valid Name',
        description: 'X'.repeat(201)
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('description')
      expect(result.errors[0].message).toContain('not exceed 200')
    })
  })

  describe('error messages', () => {
    test('provides clear error message for missing required field', () => {
      const validator = createItemValidator()
      const result = validator.validate({})

      expect(result.errors[0].message).toBe('name is required')
    })

    test('provides clear error message for length violations', () => {
      const validator = createItemValidator()
      const result = validator.validate({ name: 'AB' })

      expect(result.errors[0].message).toBe('name must be at least 3 characters')
    })

    test('collects multiple errors when applicable', () => {
      const validator = createItemValidator()
      const result = validator.validate({
        name: 'AB',
        description: 'X'.repeat(201)
      })

      expect(result.errors).toHaveLength(2)
      expect(result.errors[0].field).toBe('name')
      expect(result.errors[1].field).toBe('description')
    })
  })

  describe('real-world scenarios', () => {
    test('validates typical user input', () => {
      const validator = createItemValidator()
      const testCases = [
        {
          input: { name: 'Project Alpha', description: 'Main project for Q4' },
          expected: true
        },
        {
          input: { name: 'Bug Fix #123' },
          expected: true
        },
        {
          input: { name: 'X' },
          expected: false
        },
        {
          input: { name: '' },
          expected: false
        }
      ]

      testCases.forEach(({ input, expected }) => {
        const result = validator.validate(input)
        expect(result.valid).toBe(expected)
      })
    })
  })
})
