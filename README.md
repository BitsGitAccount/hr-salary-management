# HR Salary Management Platform

A full-stack salary management and insights tool designed for organizations managing up to 10,000 employees. Built with modern technologies following test-driven development (TDD) practices.

## Project Overview

This platform enables HR managers to:
- View and manage employee records with paginated data tables
- Add, edit, and delete employee profiles through intuitive modal dialogs
- Visualize salary insights and analytics across the organization
- Filter and analyze salary data by country and role

## Architecture

```
Assessment/
├── hr-salary-backend/     # Node.js/Express REST API
├── hr-salary-ui/          # Next.js frontend application
└── docs/
    └── adr/               # Architecture Decision Records
```

### Architecture Decision Records (ADRs)

| ADR | Title |
|-----|-------|
| [001](docs/adr/001-backend-tech-stack.md) | Backend Tech Stack |
| [002](docs/adr/002-database-schema-and-orm.md) | Database Schema and ORM |
| [003](docs/adr/003-seeding-performance-strategy.md) | Seeding Performance Strategy |
| [004](docs/adr/004-api-design-crud.md) | API Design (CRUD) |
| [006](docs/adr/006-frontend-architecture.md) | Frontend Architecture |

---

## Backend (`hr-salary-backend`)

### Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite
- **Testing**: Jest + Supertest

### Database Schema

```prisma
model Employee {
  id                      String   @id @default(uuid())
  firstName               String
  lastName                String
  jobTitle                String
  country                 String
  salary                  Int
  managerId               String?
  profileVisibilityStatus String   @default("VISIBLE_TO_ALL")
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  manager      Employee?  @relation("ManagerSubordinates")
  subordinates Employee[] @relation("ManagerSubordinates")
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/employees` | Get paginated employees |
| `GET` | `/api/employees/:id` | Get employee by ID |
| `POST` | `/api/employees` | Create new employee |
| `PUT` | `/api/employees/:id` | Update employee |
| `DELETE` | `/api/employees/:id` | Delete employee |

#### Pagination Parameters

```
GET /api/employees?page=1&limit=10
```

Response:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalCount": 10000,
    "totalPages": 1000
  }
}
```

### Project Structure

```
hr-salary-backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.js            # Database seeder (10k employees)
│   └── dev.db             # SQLite database file
├── src/
│   ├── app.ts             # Express app configuration
│   ├── server.ts          # Server entry point
│   ├── config/
│   │   └── db.ts          # Database configuration
│   ├── controllers/
│   │   └── employeeController.ts
│   ├── routes/
│   │   └── employeeRoutes.ts
│   ├── utils/
│   │   └── fileParser.ts
│   └── __tests__/         # Test files
└── package.json
```

### Setup & Running

```bash
cd hr-salary-backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (10,000 employees)
npx prisma db seed

# Start the server
npm run dev
```

The backend runs on `http://localhost:5000` by default.

### Running Tests

```bash
cd hr-salary-backend
npm test
```

---

## Frontend (`hr-salary-ui`)

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library

### Features

1. **Employee Directory**
   - Paginated data table displaying all employees
   - Full Name, Job Title, Country, and Salary columns
   - Edit and Delete action buttons per row
   - Add Employee button with modal form

2. **Employee CRUD Modals**
   - Add Employee: Create new employee records
   - Edit Employee: Modify existing employee data
   - Delete Employee: Confirmation dialog before deletion

3. **Salary Insights Dashboard**
   - Total Payroll metric card
   - Average Salary metric card
   - Highest/Lowest Salary metric cards
   - Bar chart visualization of salaries by country

### Project Structure

```
hr-salary-ui/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main page (Employee + Insights views)
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── table.tsx
│   │   ├── dashboard/
│   │   │   └── InsightsDashboard.tsx
│   │   └── employees/
│   │       ├── EmployeeTable.tsx
│   │       ├── EmployeeDialog.tsx
│   │       └── index.ts
│   ├── lib/
│   │   └── utils.ts          # Utility functions
│   └── __tests__/            # Test files
│       ├── Dashboard.test.tsx
│       ├── EmployeeTable.test.tsx
│       └── EmployeeForm.test.tsx
├── jest.config.js
├── jest.setup.ts
├── components.json           # shadcn/ui config
└── package.json
```

### Setup & Running

```bash
cd hr-salary-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

### Environment Variables

Create a `.env.local` file (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running Tests

```bash
cd hr-salary-ui
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Building for Production

```bash
npm run build
npm start
```

---

## Running the Full Stack

### Quick Start

1. **Start the Backend**
   ```bash
   cd hr-salary-backend
   npm install
   npx prisma generate
   npx prisma db seed  # Seeds 10,000 employees
   npm run dev
   ```

2. **Start the Frontend** (in a new terminal)
   ```bash
   cd hr-salary-ui
   npm install
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Running All Tests

```bash
# Backend tests
cd hr-salary-backend && npm test

# Frontend tests
cd hr-salary-ui && npm test
```

**Test Summary:**
- Backend: 17 tests across 4 test suites
- Frontend: 16 tests across 3 test suites
- **Total: 33 tests**

---

## Development Practices

### Test-Driven Development (TDD)
This project was built using strict TDD practices:
1. Write failing tests first
2. Implement minimum code to pass tests
3. Refactor while keeping tests green

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent code formatting
- Modular component architecture

---

## API Usage Examples

### Create Employee
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "jobTitle": "Software Engineer",
    "country": "United States",
    "salary": 95000
  }'
```

### Get Paginated Employees
```bash
curl "http://localhost:5000/api/employees?page=1&limit=10"
```

### Update Employee
```bash
curl -X PUT http://localhost:5000/api/employees/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 105000
  }'
```

### Delete Employee
```bash
curl -X DELETE http://localhost:5000/api/employees/{id}
```

---

## License

ISC
