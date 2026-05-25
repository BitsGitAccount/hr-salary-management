# ADR 001: Backend Tech Stack

## Status
Accepted

## Context
We are building a highly performant salary management and insights tool for an organization of 10,000 employees. We need to choose a backend technology stack that balances developer productivity, performance, and maintainability.

## Decision
We will use the following technologies for the backend:

- **Node.js** - Runtime environment
- **TypeScript** - Programming language
- **Express** - Web framework
- **Prisma ORM** - Database access and schema management
- **SQLite** - Database

## Trade-offs

### SQLite
- **Pros**: File-based and lightweight, ideal for this assessment context. Zero configuration required, no separate database server needed.
- **Cons**: Limited concurrency for write operations, not suitable for distributed deployments.

### Prisma ORM
- **Pros**: Simplifies schema management with declarative migrations, provides type-safe database access, excellent developer experience with auto-completion.
- **Cons**: Adds abstraction layer, may have performance overhead for complex queries.

### TypeScript
- **Pros**: Provides production-grade stability through static typing, catches errors at compile time, improves code maintainability and refactoring confidence.
- **Cons**: Requires compilation step, slight learning curve for JavaScript developers.

### Express
- **Pros**: Minimal and flexible, large ecosystem of middleware, well-documented and battle-tested.
- **Cons**: Requires manual setup for common patterns, less opinionated than full frameworks.

### Node.js
- **Pros**: Non-blocking I/O model ideal for handling many concurrent requests, single language across frontend and backend, large package ecosystem.
- **Cons**: Single-threaded event loop can be a bottleneck for CPU-intensive tasks.

## Consequences
- Development will be faster due to TypeScript's tooling and Prisma's developer experience
- The application will be easy to set up and run locally with SQLite
- Type safety will reduce runtime errors and improve code quality
- The stack is well-suited for the assessment context while following production best practices
