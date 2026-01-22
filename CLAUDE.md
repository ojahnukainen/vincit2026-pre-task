# Project: Meeting Room Booking API (Node.js/Express)

## 1. Project Context & Stack
- **Runtime:** Node.js (Latest LTS)
- **Framework:** Express.js
- **Database (PoC):** SQLite (File-based).
- **ORM:** Prisma (Strict schema definition).
- **Validation:** Zod (Strict input validation required).
- **Testing:** Jest + Supertest.
- **Module System:** ES Modules (`"type": "module"` in package.json).

## 2. Agentic Workflow Rules (CRITICAL)
- **DEVLOG Maintenance:** You MUST maintain a file named `DEVLOG.md` in the root.
- **Logging:** After every significant successful change, append a generic summary to `DEVLOG.md` (Date, Task, Files Changed).
- **Step-by-Step:** Do not generate all files at once. Plan, then implement, then test, then log.

## 3. Architecture & Patterns
**Strictly follow the Service-Repository Pattern:**
1.  **Routes (`/src/routes`):** Endpoint definitions only.
2.  **Controllers (`/src/controllers`):** Handle HTTP request/response, validate input using Zod, call Services.
    - *Rule:* Controllers NEVER contain business logic.
    - *Rule:* Controllers NEVER access Prisma directly.
3.  **Services (`/src/services`):** Business logic (e.g., date overlap checks, pricing).
4.  **Data Access (`/src/utils/prisma.js`):** Singleton Prisma Client instance.

## 4. Coding Standards (JavaScript Professional)
- **Type Safety via JSDoc:** **ALL** functions must have JSDoc comments defining parameters and return types to simulate type safety.
- **Error Handling:** Use a centralized error handling middleware. Pass errors to `next(err)`.
- **Async/Await:** Use `async/await` exclusively.
- **Date Handling:** ALL dates must be processed as UTC.

## 5. Testing Guidelines
- **TDD approach:** Write the test case before implementation.
- **Unit Tests:** Mock Prisma calls.
- **Integration Tests:** Use a separate SQLite file (e.g., `test.db`) if possible, or reset the DB between tests.

## 6. Common Commands
- Start Dev: `npm run dev`
- Test: `npm test`
- DB Migration: `npx prisma migrate dev --name <name>`
- Prisma Studio: `npx prisma studio`

## 7. Tool Usage Policy (Prisma MCP)
- **Primary verification tool:** You have access to the **Prisma MCP**.
- **Schema Checks:** Before writing any complex query, use the Prisma MCP to inspect the current model definitions (e.g., to check exact field names like `userId` vs `user_id`).
- **Data Verification:**
  - **Do NOT** write throwaway scripts (e.g., `check_db.js`) to verify data creation.
  - **DO** use the Prisma MCP tool to query the database directly after running a mutation.
  - *Example:* "Create the booking via API, then ask Prisma MCP to find that booking ID to confirm it saved correctly."