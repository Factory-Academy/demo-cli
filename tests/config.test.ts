import { getConfig, defaultConfig, AppConfig } from '../src/config'

describe('AppConfig', () => {
  describe('defaultConfig', () => {
    test('has all required properties', () => {
      expect(defaultConfig).toHaveProperty('defaultItemStatus')
      expect(defaultConfig).toHaveProperty('defaultWidgetPriority')
      expect(defaultConfig).toHaveProperty('errorExitCode')
      expect(defaultConfig).toHaveProperty('parseRadix')
      expect(defaultConfig).toHaveProperty('table')
    })

    test('has correct default item status', () => {
      expect(defaultConfig.defaultItemStatus).toBe('active')
    })

    test('has correct default widget priority', () => {
      expect(defaultConfig.defaultWidgetPriority).toBe(0)
    })

    test('has correct error exit code', () => {
      expect(defaultConfig.errorExitCode).toBe(1)
    })

    test('has correct parse radix', () => {
      expect(defaultConfig.parseRadix).toBe(10)
    })

    test('has table configuration', () => {
      expect(defaultConfig.table).toBeDefined()
      expect(defaultConfig.table.columnSeparator).toBe('  ')
      expect(defaultConfig.table.itemColumns).toEqual(['id', 'name', 'status', 'createdAt'])
      expect(defaultConfig.table.widgetColumns).toEqual(['id', 'name', 'itemId', 'priority'])
    })
  })

  describe('getConfig', () => {
    test('returns the default config', () => {
      const config = getConfig()
      expect(config).toEqual(defaultConfig)
    })

    test('returns a config with correct type structure', () => {
      const config: AppConfig = getConfig()
      expect(typeof config.defaultItemStatus).toBe('string')
      expect(typeof config.defaultWidgetPriority).toBe('number')
      expect(typeof config.errorExitCode).toBe('number')
      expect(typeof config.parseRadix).toBe('number')
      expect(typeof config.table).toBe('object')
    })

    test('returns immutable reference', () => {
      const config1 = getConfig()
      const config2 = getConfig()
      expect(config1).toBe(config2)
    })
  })

  describe('type safety', () => {
    test('config values can be used for their intended purpose', () => {
      const config = getConfig()
      
      // Default status should be assignable to string
      const status: string = config.defaultItemStatus
      expect(status).toBe('active')
      
      // Default priority should be usable as number
      const priority: number = config.defaultWidgetPriority
      expect(priority).toBe(0)
      
      // Exit code should be usable with process.exit
      const exitCode: number = config.errorExitCode
      expect(exitCode).toBe(1)
      
      // Parse radix should be usable with parseInt
      const radix: number = config.parseRadix
      expect(parseInt('42', radix)).toBe(42)
    })
  })
})
