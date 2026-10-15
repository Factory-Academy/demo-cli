import { config, AppConfig } from '../src/config'

describe('config', () => {
  describe('structure', () => {
    test('has required top-level properties', () => {
      expect(config).toHaveProperty('name')
      expect(config).toHaveProperty('version')
      expect(config).toHaveProperty('items')
      expect(config).toHaveProperty('widgets')
    })

    test('items config has required properties', () => {
      expect(config.items).toHaveProperty('startingId')
      expect(config.items).toHaveProperty('defaultStatus')
    })

    test('widgets config has required properties', () => {
      expect(config.widgets).toHaveProperty('startingId')
      expect(config.widgets).toHaveProperty('defaultPriority')
    })
  })

  describe('values', () => {
    test('name is non-empty string', () => {
      expect(typeof config.name).toBe('string')
      expect(config.name.length).toBeGreaterThan(0)
    })

    test('version follows semver format', () => {
      expect(typeof config.version).toBe('string')
      expect(config.version).toMatch(/^\d+\.\d+\.\d+$/)
    })

    test('items.startingId is positive number', () => {
      expect(typeof config.items.startingId).toBe('number')
      expect(config.items.startingId).toBeGreaterThan(0)
    })

    test('items.defaultStatus is non-empty string', () => {
      expect(typeof config.items.defaultStatus).toBe('string')
      expect(config.items.defaultStatus.length).toBeGreaterThan(0)
    })

    test('widgets.startingId is positive number', () => {
      expect(typeof config.widgets.startingId).toBe('number')
      expect(config.widgets.startingId).toBeGreaterThan(0)
    })

    test('widgets.defaultPriority is a number', () => {
      expect(typeof config.widgets.defaultPriority).toBe('number')
      expect(config.widgets.defaultPriority).toBeGreaterThanOrEqual(0)
    })
  })

  describe('type safety', () => {
    test('config conforms to AppConfig interface', () => {
      const testConfig: AppConfig = {
        name: config.name,
        version: config.version,
        items: config.items,
        widgets: config.widgets,
      }
      expect(testConfig).toBeDefined()
      expect(testConfig.name).toBe(config.name)
    })

    test('config object is defined and accessible', () => {
      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
    })
  })

  describe('consistency', () => {
    test('starting IDs are consistent across entities', () => {
      expect(config.items.startingId).toBe(config.widgets.startingId)
    })

    test('default values are reasonable', () => {
      expect(config.items.defaultStatus).toBe('active')
      expect(config.widgets.defaultPriority).toBe(0)
    })
  })
})
