# Initialization Tasks

Please execute the following steps to set up the project. Read `CLAUDE.md` for context first.

## Phase 1: scaffolding
1. [ ] **Package Setup**: Create `package.json` with `"type": "module"`.
2. [ ] **Dependencies**: Install `express`, `dotenv`, `zod`, `@prisma/client`.
3. [ ] **Dev Dependencies**: Install `nodemon`, `jest`, `supertest`, `prisma`.
4. [ ] **Directories**: Create `src/controllers`, `src/services`, `src/routes`, `src/middleware`, `src/utils`.

## Phase 2: Database (SQLite)
5. [ ] **Prisma Init**: Run `npx prisma init --datasource-provider sqlite`.
6. [ ] **Schema**: Update `prisma/schema.prisma` with models:
    - `User` (id, email, name)
    - `Room` (id, name, capacity, pricePerHour)
    - `Booking` (id, userId, roomId, startTime, endTime, status)
7. [ ] **Client**: Create `src/utils/prisma.js` to export a singleton `PrismaClient` instance.

## Phase 3: Server Core
8. [ ] **App Entry**: Create `src/app.js` (Express app setup, middleware, routes).
9. [ ] **Server Entry**: Create `src/server.js` (Port listening).
10. [ ] **Health Check**: Add a GET `/health` route returning `{ status: 'ok' }`.
11. [ ] **Verify**: Run the server to ensure it starts without errors.
12. [ ] **Log**: Update `DEVLOG.md` with the results of this initialization.