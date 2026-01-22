# Project Development Log

## 2026-01-20 - Project Initialization

**Task:** Initial project setup for Meeting Room Booking API

**Summary:**
- Created package.json with ES Modules configuration
- Installed production dependencies: express, dotenv, zod, @prisma/client
- Installed dev dependencies: nodemon, jest, supertest, prisma
- Created project directory structure (controllers, services, routes, middleware, utils)
- Initialized Prisma with SQLite datasource
- Created database schema with User, Room, and Booking models
- Ran initial database migration
- Created Prisma client singleton utility
- Created Express app with JSON middleware and centralized error handling
- Created server entry point with environment configuration
- Added health check endpoint (GET /health)
- Verified server starts successfully and health endpoint returns { status: 'ok' }

**Files Created/Changed:**
- `package.json`
- `prisma/schema.prisma`
- `prisma/migrations/20260120121737_init/`
- `src/utils/prisma.js`
- `src/app.js`
- `src/server.js`
- `src/routes/health.js`
- `src/middleware/errorHandler.js`

## 2026-01-20 - User CRUD Endpoints

**Task:** Implement User CRUD endpoints following Service-Repository pattern

**Summary:**
- Created User service with CRUD operations (getAllUsers, getUserById, createUser, updateUser, deleteUser, getUserByEmail)
- Created User controller with Zod validation for input data
- Created User routes (GET /, GET /:id, POST /, PUT /:id, DELETE /:id)
- Registered User routes in app.js under /users path
- Fixed Prisma 7.x compatibility issues (required better-sqlite3 adapter)
- Fixed Zod 4 error handling (uses .issues instead of .errors)
- All endpoints tested and working

**Endpoints:**
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user (validates email format and name)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

**Files Created/Changed:**
- `src/services/userService.js`
- `src/controllers/userController.js`
- `src/routes/users.js`
- `src/app.js`
- `src/utils/prisma.js` (updated for Prisma 7.x adapter)
- `package.json` (added @prisma/adapter-better-sqlite3, better-sqlite3)

## 2026-01-20 - Room CRUD Endpoints

**Task:** Implement Room CRUD endpoints following Service-Repository pattern

**Summary:**
- Created Room service with CRUD operations (getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomByName)
- Created Room controller with Zod validation for input data (name, capacity, pricePerHour)
- Created Room routes (GET /, GET /:id, POST /, PUT /:id, DELETE /:id)
- Registered Room routes in app.js under /rooms path
- All endpoints tested and working

**Endpoints:**
- `GET /rooms` - List all rooms (sorted by name)
- `GET /rooms/:id` - Get room by ID
- `POST /rooms` - Create new room (validates name, capacity as positive int, pricePerHour as positive number)
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

**Files Created/Changed:**
- `src/services/roomService.js`
- `src/controllers/roomController.js`
- `src/routes/rooms.js`
- `src/app.js`

## 2026-01-20 - Booking CRUD Endpoints

**Task:** Implement Booking CRUD endpoints with date overlap validation

**Summary:**
- Created Booking service with CRUD operations and overlap detection logic
- Overlap check excludes cancelled bookings (allowing rebooking of cancelled slots)
- Created Booking controller with Zod validation for ISO 8601 dates
- Validates user and room existence before creating bookings
- Validates end time is after start time
- Created Booking routes including cancel endpoint for soft delete
- All endpoints return booking with included user and room data
- All endpoints tested and working

**Endpoints:**
- `GET /bookings` - List all bookings (sorted by startTime, includes user/room)
- `GET /bookings/:id` - Get booking by ID (includes user/room)
- `POST /bookings` - Create booking (validates userId, roomId, startTime, endTime as ISO 8601)
- `PUT /bookings/:id` - Update booking (validates times, checks overlap)
- `DELETE /bookings/:id` - Delete booking (hard delete)
- `POST /bookings/:id/cancel` - Cancel booking (soft delete, sets status to 'cancelled')

**Business Logic:**
- Overlap detection prevents double-booking of rooms
- Cancelled bookings are excluded from overlap checks
- User and room existence validated before booking creation

**Files Created/Changed:**
- `src/services/bookingService.js`
- `src/controllers/bookingController.js`
- `src/routes/bookings.js`
- `src/app.js`

## 2026-01-20 - Integration Tests

**Task:** Write integration tests for all endpoints using Jest and Supertest

**Summary:**
- Set up Jest configuration for ES modules
- Configured separate test database (test.db) via NODE_ENV
- Created 49 integration tests covering all CRUD operations
- Tests cover success cases, validation errors, 404s, and business logic
- All tests pass

**Test Coverage:**
- User endpoints: 14 tests (CRUD, validation, duplicates)
- Room endpoints: 14 tests (CRUD, validation, duplicates)
- Booking endpoints: 21 tests (CRUD, overlap detection, cancellation, validation)

**Test Commands:**
- `npm test` - Run all tests with separate test database

**Files Created/Changed:**
- `jest.config.js`
- `src/__tests__/users.test.js`
- `src/__tests__/rooms.test.js`
- `src/__tests__/bookings.test.js`
- `src/__tests__/setup.js`
- `src/utils/prisma.js` (updated to support test database)
- `src/middleware/errorHandler.js` (suppress logs in test mode)
- `package.json` (updated test script)

## 2026-01-22 - Gitignore Update

**Task:** Update .gitignore to include files that should not be committed

**Summary:**
- Added SQLite database files pattern (*.db, *.db-journal)
- Added .claude/ directory for Claude configuration
- Added .DS_Store for macOS system files
- Added coverage/ for Jest test coverage output

**Files Created/Changed:**
- `.gitignore`
