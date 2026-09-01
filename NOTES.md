# Implementation Notes

## Table of Contents
- [Feature Flags](#feature-flags)
- [Input Validation](#input-validation)

---

# Input Validation

## Overview

The codebase includes a lightweight, composable schema-lite validation module for validating user input. The implementation provides a fluent API for building validators with common validation rules.

## Architecture

### Core Types

```typescript
interface ValidationError {
  field: string
  message: string
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

type ValidatorFn = (value: any, field: string) => ValidationError | null
```

### Validators

The validation module provides three main validator classes:

1. **StringValidator**: For string field validation
2. **NumberValidator**: For numeric field validation
3. **SchemaValidator**: For validating complete objects

**Location:** `src/utils/validation.ts`

## Usage

### String Validation

```typescript
import { string } from '../utils/validation'

// Build a string validator with multiple rules
const nameValidator = string()
  .required()
  .minLength(3)
  .maxLength(50)
  .pattern(/^[a-zA-Z\s]+$/)
  .build()

// Validate a value
const error = nameValidator('John Doe', 'name')
if (error) {
  console.error(error.message)
}
```

#### Available String Rules

- `required(message?)`: Field must not be empty or whitespace-only
- `minLength(min, message?)`: String must be at least N characters
- `maxLength(max, message?)`: String must not exceed N characters
- `pattern(regex, message?)`: String must match the given regex pattern

### Number Validation

```typescript
import { number } from '../utils/validation'

// Build a number validator
const ageValidator = number()
  .required()
  .min(0)
  .max(120)
  .integer()
  .build()

const error = ageValidator(25, 'age')
```

#### Available Number Rules

- `required(message?)`: Field must be present and not empty
- `min(min, message?)`: Number must be at least N
- `max(max, message?)`: Number must not exceed N
- `integer(message?)`: Number must be an integer

### Schema Validation

```typescript
import { schema, string, number } from '../utils/validation'

// Build a complete object schema
const userSchema = schema()
  .field('username', string().required().minLength(3).maxLength(20).build())
  .field('email', string().required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).build())
  .field('age', number().min(18).integer().build())

// Validate an object
const result = userSchema.validate({
  username: 'john_doe',
  email: 'john@example.com',
  age: 25
})

if (!result.valid) {
  result.errors.forEach(err => {
    console.error(`${err.field}: ${err.message}`)
  })
}
```

## Integration Example

The `items create` command demonstrates validation integration:

```typescript
// src/commands/item.ts
itemCommand
  .command('create')
  .requiredOption('--name <name>', 'Item name')
  .option('--description <desc>', 'Item description')
  .action((opts) => {
    // Validate input using schema-lite validators
    const validator = schema()
      .field('name', string().required().minLength(3).maxLength(50).build())
      .field('description', string().maxLength(200).build())

    const result = validator.validate({
      name: opts.name,
      description: opts.description
    })

    if (!result.valid) {
      console.error('Validation failed:')
      result.errors.forEach(err => console.error(`  - ${err.message}`))
      process.exit(1)
    }

    // Continue with item creation...
  })
```

**Try it:**

```bash
# Valid input
npm run dev items create --name "Test Item" --description "A test"

# Invalid: name too short
npm run dev items create --name "AB"

# Invalid: description too long
npm run dev items create --name "Test" --description "X...X" # 201 chars
```

## Testing

### Unit Tests

Comprehensive unit tests are provided in `tests/validation.test.ts`:

```bash
npm test validation
```

Test coverage includes:
- String validation: required, minLength, maxLength, pattern
- Number validation: required, min, max, integer
- Schema validation: multiple fields, error collection
- Custom error messages
- Edge cases: undefined, null, empty strings, whitespace

### Integration Tests

Integration tests for the item command validation are in `tests/item-validation.test.ts`:

```bash
npm test item-validation
```

## Custom Error Messages

All validation rules accept optional custom error messages:

```typescript
const validator = string()
  .required('Username cannot be empty')
  .minLength(3, 'Username must be at least 3 characters long')
  .pattern(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
  .build()
```

## Validation Patterns

### Chaining Validators

Validators are evaluated in the order they are chained. The first error encountered is returned:

```typescript
const validator = string()
  .required()      // Checked first
  .minLength(3)    // Then this
  .maxLength(50)   // Then this
  .pattern(/^[a-z]+$/)  // Finally this
  .build()
```

### Optional Fields

Fields without `.required()` are treated as optional and skip validation if not provided:

```typescript
const schema = schema()
  .field('name', string().required().build())  // Must be provided
  .field('bio', string().maxLength(500).build())  // Optional, but if provided must be ≤500 chars
```

### Combining Multiple Schemas

For complex validation, you can combine multiple validators:

```typescript
const baseValidator = schema()
  .field('name', string().required().build())
  .field('email', string().required().build())

const extendedValidator = schema()
  .field('name', string().required().build())
  .field('email', string().required().build())
  .field('age', number().min(18).build())
```

## Best Practices

1. **Fail Fast:** Validate input at the entry point (command handlers, API endpoints)

2. **Clear Messages:** Provide user-friendly error messages that explain what went wrong

3. **Consistent Rules:** Use the same validation rules across similar fields

4. **Test Edge Cases:** Always test boundary conditions (min/max lengths, empty strings, null/undefined)

5. **Document Constraints:** Document validation rules in command descriptions or API docs

## Files Modified/Created

- ✨ **Created:** `src/utils/validation.ts` - Core validation module
- ✨ **Created:** `tests/validation.test.ts` - Unit tests
- ✨ **Created:** `tests/item-validation.test.ts` - Integration tests
- 🔧 **Modified:** `src/commands/item.ts` - Applied validation to create command
- 📝 **Updated:** `NOTES.md` - Added validation documentation

## Future Enhancements

Possible extensions to consider:

- **Async validation:** Support for async validators (e.g., database uniqueness checks)
- **Custom validators:** Easy way to add domain-specific validation functions
- **Array validation:** Validate arrays of objects with nested schemas
- **Conditional validation:** Rules that apply based on other field values
- **Transform functions:** Sanitize/transform input during validation
- **Localization:** Support for translated error messages

---

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
