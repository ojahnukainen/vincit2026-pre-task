import { createRequire } from 'module';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { PrismaClient } = require('.prisma/client');

// Use a separate test database
const testDbPath = path.join(__dirname, '../../test.db');

// Copy the schema from dev.db if test.db doesn't exist
const devDbPath = path.join(__dirname, '../../dev.db');

/**
 * Create a test Prisma client
 * @returns {import('@prisma/client').PrismaClient}
 */
export const createTestPrismaClient = () => {
  const adapter = new PrismaBetterSqlite3({ url: `file:${testDbPath}` });
  return new PrismaClient({ adapter });
};

/**
 * Reset the test database by clearing all tables
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export const resetDatabase = async (prisma) => {
  // Delete in order to respect foreign key constraints
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();
};

/**
 * Create test fixtures
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export const createTestFixtures = async (prisma) => {
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  const room = await prisma.room.create({
    data: {
      name: 'Test Room',
      capacity: 10,
    },
  });

  return { user, room };
};

export { testDbPath };
