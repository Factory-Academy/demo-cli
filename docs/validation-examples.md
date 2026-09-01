# Validation Module - Usage Examples

This document provides practical examples of using the schema-lite validation module in various scenarios.

## Basic String Validation

### Required Field

```typescript
import { string } from '../utils/validation'

const validator = string().required().build()

validator('Hello', 'name')  // null (valid)
validator('', 'name')        // { field: 'name', message: 'name is required' }
validator(null, 'name')      // { field: 'name', message: 'name is required' }
validator(undefined, 'name') // { field: 'name', message: 'name is required' }
```

### Length Constraints

```typescript
import { string } from '../utils/validation'

// Username: 3-20 characters
const usernameValidator = string()
  .required()
  .minLength(3)
  .maxLength(20)
  .build()

usernameValidator('ab', 'username')     // Error: too short
usernameValidator('john', 'username')   // null (valid)
usernameValidator('a'.repeat(21), 'username') // Error: too long
```

### Pattern Matching

```typescript
import { string } from '../utils/validation'

// Email-like pattern
const emailValidator = string()
  .required()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
  .build()

emailValidator('user@example.com', 'email') // null (valid)
emailValidator('invalid-email', 'email')    // Error: Invalid email format

// Alphanumeric only
const codeValidator = string()
  .pattern(/^[a-zA-Z0-9]+$/, 'Code must be alphanumeric')
  .build()

codeValidator('ABC123', 'code')  // null (valid)
codeValidator('ABC-123', 'code') // Error: Code must be alphanumeric
```

## Basic Number Validation

### Range Validation

```typescript
import { number } from '../utils/validation'

// Age: 18-120
const ageValidator = number()
  .required()
  .min(18, 'Must be at least 18 years old')
  .max(120, 'Age cannot exceed 120')
  .integer('Age must be a whole number')
  .build()

ageValidator(25, 'age')   // null (valid)
ageValidator(17, 'age')   // Error: Must be at least 18 years old
ageValidator(25.5, 'age') // Error: Age must be a whole number
```

### Optional Number with Constraints

```typescript
import { number } from '../utils/validation'

// Priority: optional, but if provided must be 1-5
const priorityValidator = number()
  .min(1)
  .max(5)
  .integer()
  .build()

priorityValidator(undefined, 'priority') // null (valid - optional)
priorityValidator(3, 'priority')         // null (valid)
priorityValidator(0, 'priority')         // Error: must be at least 1
priorityValidator(6, 'priority')         // Error: must not exceed 5
```

## Schema Validation

### User Registration

```typescript
import { schema, string, number } from '../utils/validation'

const registrationSchema = schema()
  .field('username', string()
    .required()
    .minLength(3, 'Username must be at least 3 characters')
    .maxLength(20, 'Username cannot exceed 20 characters')
    .pattern(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .build()
  )
  .field('email', string()
    .required()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
    .build()
  )
  .field('age', number()
    .required()
    .min(18, 'You must be at least 18 years old')
    .integer()
    .build()
  )
  .field('bio', string()
    .maxLength(500, 'Bio cannot exceed 500 characters')
    .build()
  )

// Valid user
const result1 = registrationSchema.validate({
  username: 'john_doe',
  email: 'john@example.com',
  age: 25,
  bio: 'Software developer'
})
// result1.valid === true

// Invalid user (multiple errors)
const result2 = registrationSchema.validate({
  username: 'JohnDoe!',  // Contains uppercase and special char
  email: 'invalid',       // Not a valid email
  age: 16                 // Too young
})
// result2.valid === false
// result2.errors === [
//   { field: 'username', message: '...' },
//   { field: 'email', message: '...' },
//   { field: 'age', message: '...' }
// ]
```

### Item Creation (Current Implementation)

```typescript
import { schema, string } from '../utils/validation'

const itemSchema = schema()
  .field('name', string()
    .required()
    .minLength(3)
    .maxLength(50)
    .build()
  )
  .field('description', string()
    .maxLength(200)
    .build()
  )

// Usage in command handler
function createItem(opts: any) {
  const result = itemSchema.validate({
    name: opts.name,
    description: opts.description
  })

  if (!result.valid) {
    console.error('Validation failed:')
    result.errors.forEach(err => console.error(`  - ${err.message}`))
    process.exit(1)
  }

  // Proceed with creation...
}
```

### Widget Creation with Parent Reference

```typescript
import { schema, string, number } from '../utils/validation'

const widgetSchema = schema()
  .field('name', string()
    .required()
    .minLength(3)
    .maxLength(50)
    .build()
  )
  .field('itemId', string()
    .required('Parent item ID is required')
    .pattern(/^\d+$/, 'Item ID must be numeric')
    .build()
  )
  .field('priority', number()
    .min(0)
    .max(10)
    .integer()
    .build()
  )

const result = widgetSchema.validate({
  name: 'Widget A',
  itemId: '123',
  priority: 5
})
```

## Advanced Patterns

### Reusable Validators

```typescript
import { string, schema } from '../utils/validation'

// Define common validators once
const validators = {
  username: string()
    .required()
    .minLength(3)
    .maxLength(20)
    .pattern(/^[a-z0-9_]+$/)
    .build(),
  
  email: string()
    .required()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .build(),
  
  url: string()
    .pattern(/^https?:\/\/.+/, 'Must be a valid URL starting with http:// or https://')
    .build()
}

// Use in multiple schemas
const loginSchema = schema()
  .field('username', validators.username)
  .field('email', validators.email)

const profileSchema = schema()
  .field('username', validators.username)
  .field('website', validators.url)
```

### Helper Function for Validation

```typescript
import { ValidationResult } from '../utils/validation'

function validateAndReport(result: ValidationResult, action: string): boolean {
  if (!result.valid) {
    console.error(`❌ ${action} failed validation:`)
    result.errors.forEach(err => {
      console.error(`   • ${err.field}: ${err.message}`)
    })
    return false
  }
  return true
}

// Usage
const result = schema.validate(data)
if (!validateAndReport(result, 'User registration')) {
  process.exit(1)
}
```

### Conditional Validation

```typescript
import { schema, string } from '../utils/validation'

function createOrderSchema(requireShipping: boolean) {
  const schemaBuilder = schema()
    .field('customerName', string().required().build())
    .field('email', string().required().build())

  if (requireShipping) {
    schemaBuilder
      .field('shippingAddress', string().required().minLength(10).build())
      .field('city', string().required().build())
      .field('zipCode', string().required().pattern(/^\d{5}$/).build())
  }

  return schemaBuilder
}

// Physical product
const physicalOrderSchema = createOrderSchema(true)

// Digital product
const digitalOrderSchema = createOrderSchema(false)
```

## Error Handling Patterns

### CLI Command Pattern

```typescript
import { schema, string } from '../utils/validation'

export const createCommand = new Command('create')
  .requiredOption('--name <name>')
  .option('--description <desc>')
  .action((opts) => {
    const validator = schema()
      .field('name', string().required().minLength(3).build())
      .field('description', string().maxLength(200).build())

    const result = validator.validate(opts)

    if (!result.valid) {
      console.error('❌ Invalid input:')
      result.errors.forEach(err => console.error(`   ${err.message}`))
      process.exit(1)
    }

    // Execute command logic...
  })
```

### API Route Pattern (if extended to API)

```typescript
import { schema, string, number } from '../utils/validation'

function createUserHandler(req: any, res: any) {
  const validator = schema()
    .field('username', string().required().minLength(3).build())
    .field('email', string().required().build())
    .field('age', number().min(18).build())

  const result = validator.validate(req.body)

  if (!result.valid) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.errors
    })
  }

  // Create user...
  return res.status(201).json({ success: true })
}
```

## Testing Examples

### Basic Validator Test

```typescript
import { string } from '../utils/validation'

describe('username validator', () => {
  const validator = string()
    .required()
    .minLength(3)
    .maxLength(20)
    .pattern(/^[a-z0-9_]+$/)
    .build()

  test('accepts valid usernames', () => {
    expect(validator('john_doe', 'username')).toBeNull()
    expect(validator('user123', 'username')).toBeNull()
  })

  test('rejects invalid usernames', () => {
    expect(validator('ab', 'username')).not.toBeNull()
    expect(validator('UPPERCASE', 'username')).not.toBeNull()
    expect(validator('user@name', 'username')).not.toBeNull()
  })
})
```

### Schema Validator Test

```typescript
import { schema, string } from '../utils/validation'

describe('item schema', () => {
  const itemSchema = schema()
    .field('name', string().required().minLength(3).build())
    .field('description', string().maxLength(200).build())

  test('validates complete items', () => {
    const result = itemSchema.validate({
      name: 'Test Item',
      description: 'A test'
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('collects multiple errors', () => {
    const result = itemSchema.validate({
      name: 'AB',
      description: 'X'.repeat(201)
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(2)
    expect(result.errors.map(e => e.field)).toEqual(['name', 'description'])
  })
})
```

## Tips and Tricks

### 1. Build Validators Once

```typescript
// ❌ Don't rebuild on every call
function validateUser(user: any) {
  const validator = string().required().minLength(3).build()  // Rebuilt every time
  return validator(user.name, 'name')
}

// ✅ Build once, reuse
const nameValidator = string().required().minLength(3).build()

function validateUser(user: any) {
  return nameValidator(user.name, 'name')
}
```

### 2. Custom Error Messages for User-Facing Validation

```typescript
// ❌ Generic messages
string().minLength(8).build()  // "password must be at least 8 characters"

// ✅ User-friendly messages
string()
  .minLength(8, 'Your password must contain at least 8 characters for security')
  .pattern(/[A-Z]/, 'Please include at least one uppercase letter')
  .build()
```

### 3. Early Return for Performance

```typescript
// Validators return on first error, so order matters
string()
  .required()      // Fast check first
  .minLength(10)   // Then more specific checks
  .pattern(/complex-regex/)  // Expensive check last
  .build()
```
