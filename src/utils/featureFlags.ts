/**
 * Feature flag interface for environment-driven feature toggles.
 */
export interface IFeatureFlags {
  /**
   * Check if a feature flag is enabled.
   * @param flagName - The name of the feature flag (e.g., 'ENHANCED_OUTPUT')
   * @returns true if the flag is enabled, false otherwise
   */
  isEnabled(flagName: string): boolean

  /**
   * Get the raw value of a feature flag.
   * @param flagName - The name of the feature flag
   * @param defaultValue - Optional default value if flag is not set
   * @returns The flag value or default
   */
  getValue(flagName: string, defaultValue?: string): string | undefined

  /**
   * Get all enabled feature flags.
   * @returns Array of enabled flag names
   */
  getEnabledFlags(): string[]
}

/**
 * Environment-driven implementation of feature flags.
 * Reads from process.env with a configurable prefix.
 */
export class EnvFeatureFlags implements IFeatureFlags {
  private readonly prefix: string

  /**
   * @param prefix - Environment variable prefix (default: 'FEATURE_')
   */
  constructor(prefix: string = 'FEATURE_') {
    this.prefix = prefix
  }

  isEnabled(flagName: string): boolean {
    const envKey = `${this.prefix}${flagName}`
    const value = process.env[envKey]?.toLowerCase().trim()
    return value === 'true' || value === '1' || value === 'on' || value === 'yes'
  }

  getValue(flagName: string, defaultValue?: string): string | undefined {
    const envKey = `${this.prefix}${flagName}`
    return process.env[envKey] ?? defaultValue
  }

  getEnabledFlags(): string[] {
    const enabled: string[] = []
    for (const key in process.env) {
      if (key.startsWith(this.prefix)) {
        const flagName = key.substring(this.prefix.length)
        if (this.isEnabled(flagName)) {
          enabled.push(flagName)
        }
      }
    }
    return enabled
  }
}

/**
 * Default feature flag instance using FEATURE_ prefix.
 */
export const featureFlags: IFeatureFlags = new EnvFeatureFlags()
