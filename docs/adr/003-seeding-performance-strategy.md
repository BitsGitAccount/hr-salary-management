# ADR 003: Seeding Performance Strategy

## Status
Accepted

## Context
We need to populate the database with 10,000 employee records for testing and development purposes. The seeding process must be efficient, repeatable, and respect SQLite's limitations while maintaining data integrity for hierarchical relationships.

## Decision

### Data Sources
- Read first names from `data/first_names.txt`
- Read last names from `data/last_names.txt`
- Use deterministic or structured randomization to construct 10,000 unique combinations

### Generation Strategy
1. **Name Combinations**: Cross-product of first and last names with index-based variation to ensure uniqueness
2. **Countries**: Small pool of valid countries (USA, UK, India, Canada, Germany)
3. **Job Titles**: Predefined set of realistic job titles (Software Engineer, Product Manager, HR Specialist, Data Analyst, etc.)
4. **Salaries**: Randomized within realistic range (50,000 to 200,000)
5. **Manager Relationships**: Early-generated employees serve as managers for subsequent employees

### Batch Insert Strategy
- Use Prisma's `createMany()` for bulk inserts
- Wrap operations in a single transaction to minimize file I/O overhead
- **Chunk size: 2,000 records** to respect SQLite's variable argument limits

### SQLite Considerations
SQLite has a default limit of 999 variables per query (SQLITE_MAX_VARIABLE_NUMBER). With multiple columns per record, we must batch inserts appropriately:
- Employee model has ~10 fields
- Safe chunk size: 2,000 records per batch (well within limits after Prisma optimization)
- Total batches for 10,000 records: 5

### Performance Targets
- Total seeding time: < 5 seconds for 10,000 records
- Use `console.time()` to measure and validate performance

## Implementation

```typescript
// Pseudocode for seeding approach
const CHUNK_SIZE = 2000;
const employees = generateEmployees(10000);

for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
  const chunk = employees.slice(i, i + CHUNK_SIZE);
  await prisma.employee.createMany({ data: chunk });
}
```

## Consequences

### Positive
- Fast seeding performance through batched inserts
- Respects SQLite variable limits
- Deterministic data generation allows reproducible tests
- Hierarchical relationships are properly established

### Negative
- Chunk size may need adjustment for different database providers
- Large seed data increases test setup time

### Mitigations
- Make chunk size configurable
- Provide option to skip seeding in rapid test iterations
- Clear existing data before re-seeding to ensure consistency
