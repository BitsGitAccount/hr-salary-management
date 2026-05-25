# ADR 002: Database Schema and ORM

## Status
Accepted

## Context
We need to define a database schema for storing employee data in our salary management and insights tool. The schema must support hierarchical organizational structures and privacy controls for sensitive salary information during manager reviews.

## Decision

### ORM Choice: Prisma
We will use Prisma ORM for database access and schema management. Prisma provides:
- Declarative schema definition
- Type-safe database queries
- Automatic migrations
- Excellent TypeScript integration

### Database: SQLite
SQLite is used as the database for this assessment context due to its simplicity and zero-configuration setup.

### Employee Model Structure

The `Employee` model will contain the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Unique identifier for each employee |
| `firstName` | String | Employee's first name |
| `lastName` | String | Employee's last name |
| `jobTitle` | String | Employee's job title/position |
| `country` | String | Country where employee is based |
| `salary` | Int | Employee's salary (in base currency units) |
| `managerId` | String (optional) | Self-referencing foreign key for hierarchy mapping |
| `profileVisibilityStatus` | String | Privacy control for profile visibility |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Record last update timestamp |

### Organizational Hierarchy
The `managerId` field establishes a self-referencing relationship that enables:
- Mapping of reporting structures
- Traversal of organizational hierarchy
- Manager-subordinate relationship queries

### Profile Visibility Status
The `profileVisibilityStatus` field supports security rules during manager reviews with three levels:

| Value | Description |
|-------|-------------|
| `VISIBLE_TO_ALL` | Profile and salary visible to all authorized users |
| `MANAGER_ONLY` | Profile and salary visible only to direct manager and above |
| `PRIVATE` | Profile and salary visible only to HR and the employee themselves |

**Note:** Since SQLite doesn't natively support custom ENUM types, this field is stored as a String with application-level validation.

## Consequences

### Positive
- Self-referencing relationship enables flexible hierarchy queries
- Privacy controls allow granular access management
- Prisma provides type safety and easy schema evolution
- UUID identifiers prevent enumeration attacks

### Negative
- Self-referencing queries may require careful optimization for deep hierarchies
- String-based enum requires application-level validation
- SQLite limitations may require migration for production scale

### Mitigations
- Implement depth limits for hierarchy traversal
- Add validation middleware for enum values
- Plan migration path to PostgreSQL for production deployment
