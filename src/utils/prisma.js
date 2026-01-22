import { createRequire } from 'module';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { PrismaClient } = require('.prisma/client');

// Use test database if NODE_ENV is test
const dbFile = process.env.NODE_ENV === 'test' ? 'test.db' : 'dev.db';
const dbPath = path.join(__dirname, '../../', dbFile);
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

/**
 * Singleton PrismaClient instance for database operations.
 * @type {import('@prisma/client').PrismaClient}
 */
const prisma = new PrismaClient({ adapter });

export default prisma;
