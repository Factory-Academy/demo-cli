import { validateOrThrow } from '../src/utils/validators'

describe('widget validation', () => {
  const widgetSchema = {
    name: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    itemId: {
      type: 'string' as const,
      required: true,
      pattern: /^[a-zA-Z0-9-_]+$/,
    },
    priority: {
      type: 'number' as const,
      min: 0,
      max: 10,
    },
  }

  test('validates correct widget data', () => {
    const data = {
      name: 'Test Widget',
      itemId: 'item-123',
      priority: '5',
    }
    expect(() => validateOrThrow(data, widgetSchema)).not.toThrow()
  })

  test('rejects empty name', () => {
    const data = {
      name: '',
      itemId: 'item-123',
      priority: '5',
    }
    expect(() => validateOrThrow(data, widgetSchema)).toThrow('name is required')
  })

  test('rejects name exceeding max length', () => {
    const data = {
      name: 'a'.repeat(101),
      itemId: 'item-123',
      priority: '5',
    }
    expect(() => validateOrThrow(data, widgetSchema)).toThrow('name must be at most 100 characters')
  })

  test('rejects invalid itemId format', () => {
    const data = {
      name: 'Test Widget',
      itemId: 'item@123!',
      priority: '5',
    }
    expect(() => validateOrThrow(data, widgetSchema)).toThrow('itemId has an invalid format')
  })

  test('accepts valid itemId with alphanumeric, dashes, and underscores', () => {
    const data = {
      name: 'Test Widget',
      itemId: 'item_123-abc',
      priority: '5',
    }
    expect(() => validateOrThrow(data, widgetSchema)).not.toThrow()
  })

  test('rejects priority below minimum', () => {
    const data = {
      name: 'Test Widget',
      itemId: 'item-123',
      priority: '-1',
    }
    expect(() => validateOrThrow(data, widgetSchema)).toThrow('priority must be at least 0')
  })

  test('rejects priority above maximum', () => {
    const data = {
      name: 'Test Widget',
      itemId: 'item-123',
      priority: '11',
    }
    expect(() => validateOrThrow(data, widgetSchema)).toThrow('priority must be at most 10')
  })

  test('rejects non-numeric priority', () => {
    const data = {
      name: 'Test Widget',
      itemId: 'item-123',
      priority: 'high',
    }
    expect(() => validateOrThrow(data, widgetSchema)).toThrow('priority must be a valid number')
  })

  test('accepts priority as string number', () => {
    const data = {
      name: 'Test Widget',
      itemId: 'item-123',
      priority: '7',
    }
    expect(() => validateOrThrow(data, widgetSchema)).not.toThrow()
  })

  test('rejects missing required fields', () => {
    const data = {
      name: 'Test Widget',
    }
    expect(() => validateOrThrow(data, widgetSchema)).toThrow('itemId is required')
  })

  test('validates all rules together', () => {
    const data = {
      name: '',
      itemId: 'invalid id!',
      priority: '15',
    }
    try {
      validateOrThrow(data, widgetSchema)
      fail('Should have thrown')
    } catch (error) {
      const message = (error as Error).message
      expect(message).toContain('name is required')
      expect(message).toContain('itemId has an invalid format')
      expect(message).toContain('priority must be at most 10')
    }
  })
})
