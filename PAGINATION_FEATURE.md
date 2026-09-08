# Pagination Helper Module

## Overview
Added cursor-based pagination functionality to the CLI with a reusable pagination helper module.

## Implementation

### Core Module: `src/utils/pagination.ts`
- **`encodeCursor(offset: number): string`** - Encodes numeric offset as base64 cursor
- **`decodeCursor(cursor: string): number`** - Decodes cursor with validation
- **`paginate<T>(items: T[], options: PaginationOptions): PaginatedResult<T>`** - Main pagination function

Returns:
- `items[]` - Current page items
- `nextCursor?` - Opaque cursor for next page (undefined on last page)
- `hasMore` - Boolean flag indicating more items available

### Integration: `src/commands/item.ts`
Updated the `items list` command with:
- `--cursor <cursor>` - Pagination cursor for next page
- `--limit <limit>` - Items per page (default: 10)

Pagination is applied after filtering, maintaining compatibility with existing `--status` filter.

### Tests
**`tests/pagination.test.ts`** - Comprehensive unit tests:
- Cursor encoding/decoding with validation
- Pagination across multiple pages
- Edge cases: empty arrays, large limits, invalid cursors
- Pagination consistency verification

**`tests/item.test.ts`** - Integration tests:
- Multi-page pagination flow
- Filter + pagination combination

## Usage Example

```bash
# List first 5 items
demo-cli items list --limit 5

# Get next page using returned cursor
demo-cli items list --limit 5 --cursor <cursor_from_previous_output>

# Combine with filtering
demo-cli items list --status active --limit 10
```

## Files Modified/Created
1. `src/utils/pagination.ts` (new)
2. `src/commands/item.ts` (modified)
3. `tests/pagination.test.ts` (new)
4. `tests/item.test.ts` (modified)

## Design Decisions
- **Cursor-based over offset-based**: More robust for changing datasets
- **Base64 encoding**: Simple, opaque cursor format
- **Zero-based offsets internally**: Standard array indexing
- **Validation in decodeCursor**: Prevents invalid or malicious cursors
- **Generic implementation**: Works with any array type via TypeScript generics
