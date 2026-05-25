# ADR 006: Frontend Architecture

## Status
Accepted

## Context
We need a frontend UI layer for our salary management platform that can efficiently display and manage 10,000 employees. The UI must support paginated data tables, interactive charts for salary insights, and accessible modal forms for CRUD operations.

## Decision
We will use the following technologies for the frontend:

- **Next.js (App Router)** - React framework with modern app directory structure
- **TypeScript** - Programming language for type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui (Radix UI primitives)** - Accessible component library
- **Lucide React** - Icon library for clean HR iconography
- **Recharts** - Charting library for salary insights visualization

## Trade-offs

### Next.js (App Router)
- **Pros**: Unified React architecture with server components, built-in routing, excellent developer experience, automatic code splitting, and optimized performance out of the box.
- **Cons**: Learning curve for App Router patterns, more opinionated than plain React.

### Tailwind CSS
- **Pros**: Utility-first approach enables rapid UI development, no context switching between CSS files, highly customizable design system, excellent integration with component libraries.
- **Cons**: Verbose class names in markup, requires learning utility class conventions.

### shadcn/ui (Radix UI primitives)
- **Pros**: Accessible by default (WAI-ARIA compliant), unstyled primitives allow full customization, copy-paste component ownership, works seamlessly with Tailwind CSS.
- **Cons**: Components are copied into project (more code to maintain), requires manual updates for new versions.

### Lucide React
- **Pros**: Clean, consistent icon set perfect for HR/business applications, lightweight, tree-shakeable, actively maintained fork of Feather Icons.
- **Cons**: Limited to line-style icons, may need supplemental icons for specific use cases.

### Recharts
- **Pros**: Declarative React-based charting, built on D3.js, responsive by default, good documentation and TypeScript support.
- **Cons**: Bundle size can be significant, limited customization compared to raw D3.

## Consequences
- The frontend will have a consistent, accessible design system
- Development velocity will be high due to Tailwind's utility classes and shadcn's pre-built components
- Charts will integrate naturally with React state management
- The application will be performant with Next.js optimizations
- Components will be fully owned and customizable within the project
