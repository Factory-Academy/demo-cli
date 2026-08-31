# Feature Flags - Implementation Notes

## Overview

This codebase now includes an environment-driven feature flag system that allows toggling features at runtime without code changes. The implementation uses a clean interface-based design for flexibility and testability.

## Architecture

### Interface: `IFeatureFlags`

The `IFeatureFlags` interface defines the contract for feature flag providers:

```typescript
interface IFeatureFlags {
  isEnabled(flagName: string): boolean
  getValue(flagName: string, defaultValue?: string): string | undefined
  getEnabledFlags(): string[]
}
```

### Implementation: `EnvFeatureFlags`

The default implementation reads flags from environment variables with a configurable prefix (default: `FEATURE_`).

**Location:** `src/utils/featureFlags.ts`

## Usage

### Basic Usage

```typescript
import { featureFlags } from '../utils/featureFlags'

// Check if a feature is enabled
if (featureFlags.isEnabled('ENHANCED_OUTPUT')) {
  // Execute feature-specific code
}

// Get a flag value with optional default
const theme = featureFlags.getValue('THEME', 'default')

// List all enabled flags
const enabled = featureFlags.getEnabledFlags()
console.log('Active features:', enabled)
```

### Setting Feature Flags

Feature flags are controlled via environment variables:

```bash
# Enable a feature (multiple formats supported)
export FEATURE_ENHANCED_OUTPUT=true   # boolean
export FEATURE_ENHANCED_OUTPUT=1      # numeric
export FEATURE_ENHANCED_OUTPUT=on     # keyword
export FEATURE_ENHANCED_OUTPUT=yes    # keyword

# Disable a feature
export FEATURE_ENHANCED_OUTPUT=false
export FEATURE_ENHANCED_OUTPUT=0

# Set a value-based flag
export FEATURE_THEME=dark
export FEATURE_MAX_ITEMS=100
```

### Recognized True Values

The system recognizes these values as "enabled" (case-insensitive):
- `true`
- `1`
- `on`
- `yes`

All other values are considered disabled/false.

## Integration Example

The `items list` command demonstrates feature flag integration:

```typescript
// src/commands/item.ts
const enhancedOutput = featureFlags.isEnabled('ENHANCED_OUTPUT')
const columns = enhancedOutput
  ? ['id', 'name', 'description', 'status', 'createdAt']
  : ['id', 'name', 'status', 'createdAt']

console.log(formatTable(filtered, columns))
```

**Try it:**

```bash
# Standard output
npm run dev items list

# Enhanced output with description column
FEATURE_ENHANCED_OUTPUT=true npm run dev items list
```

## Testing

### Unit Tests

Comprehensive unit tests are provided in `tests/featureFlags.test.ts`:

```bash
npm test featureFlags
```

Test coverage includes:
- Boolean flag evaluation (true/false, 1/0, on/off, yes/no)
- Case-insensitive matching
- Whitespace handling
- Value retrieval with defaults
- Listing enabled flags
- Custom prefix support

### Testing with Feature Flags

When writing tests that depend on feature flags:

```typescript
describe('feature with flag', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env.FEATURE_MY_FLAG = 'true'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('behaves correctly when enabled', () => {
    // Test implementation
  })
})
```

## Customization

### Custom Prefix

Create an instance with a different prefix:

```typescript
import { EnvFeatureFlags } from '../utils/featureFlags'

const appFlags = new EnvFeatureFlags('APP_FLAG_')
// Now reads from APP_FLAG_* environment variables
```

### Mock Implementation

For testing, you can provide a mock implementation:

```typescript
class MockFeatureFlags implements IFeatureFlags {
  constructor(private enabledFlags: Set<string>) {}
  
  isEnabled(flagName: string): boolean {
    return this.enabledFlags.has(flagName)
  }
  
  getValue(flagName: string, defaultValue?: string): string | undefined {
    return this.isEnabled(flagName) ? 'enabled' : defaultValue
  }
  
  getEnabledFlags(): string[] {
    return Array.from(this.enabledFlags)
  }
}
```

## Best Practices

1. **Naming Convention:** Use UPPER_SNAKE_CASE for flag names (e.g., `ENHANCED_OUTPUT`, `DEBUG_MODE`)

2. **Boolean vs Value Flags:**
   - Use `isEnabled()` for on/off toggles
   - Use `getValue()` for configuration values

3. **Fallback Behavior:** Always provide sensible defaults for when flags are not set

4. **Documentation:** Document each feature flag's purpose near where it's used

5. **Cleanup:** Remove feature flags once features are fully rolled out

## Files Modified/Created

- ✨ **Created:** `src/utils/featureFlags.ts` - Core implementation
- ✨ **Created:** `tests/featureFlags.test.ts` - Unit tests
- 🔧 **Modified:** `src/commands/item.ts` - Integration example
- 📝 **Created:** `NOTES.md` - This documentation

## Future Enhancements

Possible extensions to consider:

- **Remote configuration:** Fetch flags from a config service
- **User-specific flags:** Enable features per user/role
- **Flag metadata:** Description, owner, expiration dates
- **Admin interface:** CLI command to list/toggle flags
- **Metrics:** Track flag usage and performance impact
