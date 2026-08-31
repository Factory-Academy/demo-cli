import { EnvFeatureFlags, IFeatureFlags } from '../src/utils/featureFlags'

describe('EnvFeatureFlags', () => {
  let originalEnv: NodeJS.ProcessEnv
  let flags: IFeatureFlags

  beforeEach(() => {
    originalEnv = { ...process.env }
    // Clear all FEATURE_ env vars
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('FEATURE_')) {
        delete process.env[key]
      }
    })
    flags = new EnvFeatureFlags()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isEnabled', () => {
    test('returns true for "true" value', () => {
      process.env.FEATURE_TEST = 'true'
      expect(flags.isEnabled('TEST')).toBe(true)
    })

    test('returns true for "1" value', () => {
      process.env.FEATURE_TEST = '1'
      expect(flags.isEnabled('TEST')).toBe(true)
    })

    test('returns true for "on" value', () => {
      process.env.FEATURE_TEST = 'on'
      expect(flags.isEnabled('TEST')).toBe(true)
    })

    test('returns true for "yes" value', () => {
      process.env.FEATURE_TEST = 'yes'
      expect(flags.isEnabled('TEST')).toBe(true)
    })

    test('returns true for "TRUE" (case insensitive)', () => {
      process.env.FEATURE_TEST = 'TRUE'
      expect(flags.isEnabled('TEST')).toBe(true)
    })

    test('returns false for "false" value', () => {
      process.env.FEATURE_TEST = 'false'
      expect(flags.isEnabled('TEST')).toBe(false)
    })

    test('returns false for "0" value', () => {
      process.env.FEATURE_TEST = '0'
      expect(flags.isEnabled('TEST')).toBe(false)
    })

    test('returns false for undefined flag', () => {
      expect(flags.isEnabled('NONEXISTENT')).toBe(false)
    })

    test('handles whitespace in values', () => {
      process.env.FEATURE_TEST = '  true  '
      expect(flags.isEnabled('TEST')).toBe(true)
    })
  })

  describe('getValue', () => {
    test('returns the raw value of a flag', () => {
      process.env.FEATURE_CONFIG = 'custom_value'
      expect(flags.getValue('CONFIG')).toBe('custom_value')
    })

    test('returns undefined for unset flag', () => {
      expect(flags.getValue('NONEXISTENT')).toBeUndefined()
    })

    test('returns default value when flag is not set', () => {
      expect(flags.getValue('NONEXISTENT', 'default')).toBe('default')
    })

    test('returns actual value over default when set', () => {
      process.env.FEATURE_CONFIG = 'actual'
      expect(flags.getValue('CONFIG', 'default')).toBe('actual')
    })
  })

  describe('getEnabledFlags', () => {
    test('returns empty array when no flags are enabled', () => {
      expect(flags.getEnabledFlags()).toEqual([])
    })

    test('returns only enabled flags', () => {
      process.env.FEATURE_FLAG_A = 'true'
      process.env.FEATURE_FLAG_B = 'false'
      process.env.FEATURE_FLAG_C = '1'
      
      const enabled = flags.getEnabledFlags()
      expect(enabled).toContain('FLAG_A')
      expect(enabled).toContain('FLAG_C')
      expect(enabled).not.toContain('FLAG_B')
    })

    test('ignores non-FEATURE_ environment variables', () => {
      process.env.OTHER_VAR = 'true'
      process.env.FEATURE_TEST = 'true'
      
      const enabled = flags.getEnabledFlags()
      expect(enabled).toEqual(['TEST'])
    })
  })

  describe('custom prefix', () => {
    test('uses custom prefix for flag lookup', () => {
      const customFlags = new EnvFeatureFlags('APP_FLAG_')
      process.env.APP_FLAG_CUSTOM = 'true'
      process.env.FEATURE_OTHER = 'true'
      
      expect(customFlags.isEnabled('CUSTOM')).toBe(true)
      expect(customFlags.isEnabled('OTHER')).toBe(false)
    })

    test('getEnabledFlags respects custom prefix', () => {
      const customFlags = new EnvFeatureFlags('APP_')
      process.env.APP_ONE = 'true'
      process.env.FEATURE_TWO = 'true'
      
      const enabled = customFlags.getEnabledFlags()
      expect(enabled).toEqual(['ONE'])
    })
  })
})
