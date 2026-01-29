import { createRequire } from 'module';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { PrismaClient } = require('.prisma/client');

const dbPath = path.join(__dirname, '../dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  
  const conferenceA = await prisma.room.upsert({
    where: { name: 'Conference Room A' },
    update: {},
    create: {
      name: 'Conference Room A',
      capacity: 20,
    },  
  })
  const musicRoom = await prisma.room.upsert({
    where: { name: 'Music room' },
    update: {},
    create: {
      name: 'Music room',
      capacity: 10,
    },  
  })
    const movieRoom = await prisma.room.upsert({
    where: { name: 'Movie room' },
    update: {},
    create: {
      name: 'Movie room',
      capacity: 75,
    },  
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'otto@thisproduct.com' },
    update: {},
    create: {
      email: 'otto@thisproduct.com',
      name: 'Otto',
    },
  })

  const booking1 = await prisma.booking.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user1.id,
      roomId: conferenceA.id,
      description: 'Team meeting',
      startTime: new Date('2026-12-02T10:00:00Z'),
      endTime: new Date('2026-12-02T12:00:00Z'),
    },
  })

  console.log({ conferenceA, musicRoom, movieRoom, user1, booking1 });
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

