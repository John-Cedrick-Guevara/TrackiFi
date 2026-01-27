# TrackiFi — Coding Agent Context README

> **IMPORTANT:**  
> This file is the **single source of truth** for all feature development in TrackiFi.  
> Every feature, refactor, or enhancement must align with the principles, rules, and constraints defined here.

---

## 1. Project Overview

**TrackiFi** is a modern fintech SaaS application designed to help individuals track, understand, and optimize their personal finances.

### Core Capabilities
- Track income and expenses (cashflow)
- Monitor investments
- Define and track savings goals
- Visualize financial data through analytics and insights

### Product Goal
To provide **clear financial visibility and control** through a clean, intuitive, and data-driven experience — without unnecessary complexity.

### Target Users
- Young professionals
- Freelancers and self-employed individuals
- Startup founders
- Finance-conscious users seeking clarity and structure

---

## 2. Tech Stack & Rationale

### Frontend
- **React (TypeScript)**  
  Component-based UI, strong ecosystem, long-term maintainability.
- **TanStack Router**  
  Type-safe routing with explicit data loading and route boundaries.
- **TanStack Query**  
  Server-state management, caching, request deduplication.

### Backend
- **Hono**  
  Lightweight, edge-friendly backend framework for API orchestration and business logic.

### Backend-as-a-Service
- **Supabase**
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Storage & Realtime (future)

### Architectural Assumption
- Serverless / Edge-first compatible
- No monolithic backend
- Clear separation of responsibilities

---

## 3. Architectural Philosophy (Non-Negotiable)

### ❌ Explicitly NOT Using
- Classic MVC
- Fat controllers
- Direct client → database access for sensitive logic
- Business logic inside React components

### ✅ We Use
- **Feature-based architecture**
- **Layered responsibilities**
- **Thin routes, strong services**
- **Database as source of truth with enforced security**

---

## 4. System Architecture Overview
React Client
↓
Hono API (Business Logic + Validation)
↓
Supabase (Auth, DB, RLS)


### Responsibility Split
- **Client:** UI, UX validation, data orchestration
- **API:** Business rules, workflows, authorization logic
- **Database:** Persistence, security (RLS), aggregations

---

## 5. Frontend Rules & Conventions

### Folder Structure
src/
  routes/
    _layout.tsx
    dashboard/
      route.tsx
      components/
    transactions/
      route.tsx

  features/
    transactions/
      components/
      hooks/
      api.ts
      types.ts
    investments/
      components/
      hooks/
      api.ts
      types.ts



### Component Rules
- Keep components small and focused
- Use TanStack Query for data fetching
- No business logic in components
- Use TypeScript strictly
- Prefer functional components with hooks

### Data Fetching
- Use TanStack Query for all data operations
- Create API client per feature
- Handle loading, error, and success states explicitly
- Use optimistic updates where appropriate

---

## 6. Backend Rules & Conventions

### Folder Structure
src/
routes/
services/
validators/
types/
utils/

### Route Rules
- Routes should be thin and declarative
- All validation happens in validators/
- Business logic lives in services/
- No direct database access in routes

### Service Rules
- Services contain business logic
- Services orchestrate database operations
- Services can call other services
- Services must be pure where possible

### Validation Rules
- Use Zod for all validation
- Validate input in routes before calling services
- Return clear error messages

---

## 7. Database Rules & Conventions

### Security
- RLS must be enabled on all tables
- No direct client → database access
- All sensitive operations go through API

### Schema Design
- Use snake_case for columns
- Use plural table names
- Include metadata columns (created_at, updated_at, etc.)
- Use proper foreign key constraints

---

## 8. Feature Development Workflow

### Standard Feature Pattern
1. Create feature folder: `src/features/<feature-name>`
2. Create components, hooks, api.ts, routes.tsx, types.ts
3. Implement API routes with validation and services
4. Implement frontend with TanStack Query
5. Add tests
6. Document in feature README

### Example: Savings Goals Feature
src/features/savings-goals/
components/
hooks/
api.ts
routes.tsx
types.ts

---

## 9. Non-Functional Requirements

### Performance
- Fast load times (<2s)
- Responsive UI (<100ms interactions)
- Efficient data fetching
- Minimal bundle size

### Security
- RLS enabled
- Input validation on all endpoints
- Proper authentication and authorization
- No sensitive data in client code

### Maintainability
- Clean architecture
- TypeScript strict mode
- Clear separation of concerns
- Comprehensive documentation

---

## 10. Coding Standards

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case

### TypeScript Rules
- Use strict mode
- Prefer interfaces over types for public APIs
- Use generics where appropriate
- Avoid `any` type

### Git Conventions
- Conventional commits
- Atomic commits
- Meaningful commit messages

---

## 11. Testing Requirements

### Frontend
- Unit tests for components
- Integration tests for features
- E2E tests for critical flows

### Backend
- Unit tests for services
- Integration tests for routes
- Contract tests for API

---

## 12. Documentation Requirements

### Required Documentation
- Feature READMEs
- API documentation
- Architecture overview
- Setup guide
- Deployment guide

---

## 13. Development Rules

### When Creating a New Feature
1. Read this README
2. Understand the feature requirements
3. Follow the feature development workflow
4. Create proper documentation
5. Add tests
6. Get code review

### When Modifying an Existing Feature
1. Understand the existing code
2. Follow the feature development workflow
3. Update documentation if needed
4. Add tests
5. Get code review

---

## 14. Critical Rules (Non-Negotiable)

1. **No business logic in React components**
2. **All validation happens in API layer**
3. **RLS must be enabled on all tables**
4. **TypeScript strict mode must be enabled**
5. **Conventional commits must be used**
6. **Feature READMEs must be created for each feature**
7. **No direct client → database access**
8. **Keep components small and focused**
9. **Use TanStack Query for all data operations**
10. **Routes must be thin and declarative**

---

## 15. Quick Reference

### Frontend Structure
src/features/<feature-name>/
├── components/
├── hooks/
├── api.ts
├── routes.tsx
└── types.ts

### Backend Structure
src/
├── routes/
├── services/
├── validators/
├── types/
└── utils/

### Git Commits
feat: add new feature
fix: fix a bug
docs: update documentation
test: add or update tests
refactor: refactor existing code
chore: maintenance tasks

---

## 16. Final Note

> **This README is the single source of truth for all feature development in TrackiFi.**  
> Every feature, refactor, or enhancement must align with the principles, rules, and constraints defined here.




**When in doubt, always refer to this README first.**

