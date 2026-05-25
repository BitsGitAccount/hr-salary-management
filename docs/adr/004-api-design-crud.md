# ADR 004: CRUD API Design

## Status
Accepted

## Context
We need to expose RESTful endpoints for managing employee data. The API must support standard CRUD operations with proper validation, error handling, and pagination for list operations.

## Decision

### RESTful Route Design

#### POST /api/employees
Creates a new employee record.

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "jobTitle": "string (required)",
  "country": "string (required)",
  "salary": "number (required)",
  "managerId": "string (optional, must exist if provided)",
  "profileVisibilityStatus": "string (optional, defaults to VISIBLE_TO_ALL)"
}
```

**Response:**
- `201 Created` - Returns the created employee object
- `400 Bad Request` - Missing required fields or validation errors
- `404 Not Found` - If provided managerId doesn't exist

#### GET /api/employees
Returns a paginated list of employees.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Records per page

**Response:**
```json
{
  "data": [...employees],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalCount": 10000,
    "totalPages": 1000
  }
}
```

#### GET /api/employees/:id
Returns a single employee by ID.

**Response:**
- `200 OK` - Returns the employee object
- `404 Not Found` - Employee doesn't exist

#### PUT /api/employees/:id
Updates an existing employee record (partial updates supported).

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "jobTitle": "string (optional)",
  "country": "string (optional)",
  "salary": "number (optional)",
  "managerId": "string (optional)",
  "profileVisibilityStatus": "string (optional)"
}
```

**Response:**
- `200 OK` - Returns the updated employee object
- `400 Bad Request` - Validation errors
- `404 Not Found` - Employee doesn't exist

#### DELETE /api/employees/:id
Removes an employee record.

**Response:**
- `204 No Content` - Successfully deleted
- `404 Not Found` - Employee doesn't exist

### Validation Rules
1. Required fields for creation: `firstName`, `lastName`, `jobTitle`, `country`, `salary`
2. `salary` must be a positive integer
3. `profileVisibilityStatus` must be one of: `VISIBLE_TO_ALL`, `MANAGER_ONLY`, `PRIVATE`
4. If `managerId` is provided, the referenced employee must exist

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## Consequences

### Positive
- RESTful conventions make API intuitive and predictable
- Pagination prevents memory issues with large datasets
- Validation ensures data integrity
- Consistent error format simplifies client error handling

### Negative
- Pagination adds complexity to list queries
- Validation of managerId requires additional database lookup

### Mitigations
- Use efficient Prisma queries with `skip` and `take` for pagination
- Cache manager lookups where appropriate
