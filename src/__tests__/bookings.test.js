import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';
import { jest } from '@jest/globals';
import timeUtils, { getCurrentTime } from '../utils/time.js';

describe('Booking Endpoints', () => {
  let testUser;
  let testRoom;

  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.user.deleteMany();
    await prisma.room.deleteMany();

    // Create test fixtures
    testUser = await prisma.user.create({
      data: { email: 'booker@example.com', name: 'Test Booker' },
    });

    testRoom = await prisma.room.create({
      data: { name: 'Test Room', capacity: 10, pricePerHour: 50 },
    });

    // Mock current time to a fixed point freeze time for testing bookings in the past. 19.1.2026 09:00 UTC
    jest.spyOn(timeUtils, 'getCurrentTime').mockReturnValue(new Date('2026-01-19T09:00:00Z'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /bookings', () => {
    it('should return empty array when no bookings exist', async () => {
      const res = await request(app).get('/bookings');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all bookings with user and room data', async () => {
      await prisma.booking.create({
        data: {
          userId: testUser.id,
          roomId: testRoom.id,
          startTime: new Date('2026-01-21T10:00:00Z'),
          endTime: new Date('2026-01-21T12:00:00Z'),
        },
      });

      const res = await request(app).get('/bookings');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].user).toBeDefined();
      expect(res.body[0].room).toBeDefined();
      expect(res.body[0].user.email).toBe('booker@example.com');
      expect(res.body[0].room.name).toBe('Test Room');
      });
    });

    describe('GET /bookings/:id', () => {
      it('should return a booking by ID with user and room data', async () => {
        const booking = await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });

        const res = await request(app).get(`/bookings/${booking.id}`);

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('booker@example.com');
        expect(res.body.room.name).toBe('Test Room');
      });

      it('should return 404 for non-existent booking', async () => {
        const res = await request(app).get('/bookings/999');

        expect(res.status).toBe(404);
        expect(res.body.error.message).toBe('Booking not found');
      });
    });

    describe('POST /bookings', () => {
      it('should create a new booking', async () => {
        const res = await request(app)
          .post('/bookings')
          .send({
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: '2026-01-21T10:00:00Z',
            endTime: '2026-01-21T12:00:00Z',
          });

        expect(res.status).toBe(201);
        expect(res.body.userId).toBe(testUser.id);
        expect(res.body.roomId).toBe(testRoom.id);
        expect(res.body.status).toBe('confirmed');
        expect(res.body.user).toBeDefined();
        expect(res.body.room).toBeDefined();
      });

      it('should return 404 for non-existent user', async () => {
        const res = await request(app)
          .post('/bookings')
          .send({
            userId: 999,
            roomId: testRoom.id,
            startTime: '2026-01-21T10:00:00Z',
            endTime: '2026-01-21T12:00:00Z',
          });

        expect(res.status).toBe(404);
        expect(res.body.error.message).toBe('User not found');
      });

      it('should return 404 for non-existent room', async () => {
        const res = await request(app)
          .post('/bookings')
          .send({
            userId: testUser.id,
            roomId: 999,
            startTime: '2026-01-21T10:00:00Z',
            endTime: '2026-01-21T12:00:00Z',
          });

        expect(res.status).toBe(404);
        expect(res.body.error.message).toBe('Room not found');
      });

      it('should return 400 when end time is before start time', async () => {
        const res = await request(app)
          .post('/bookings')
          .send({
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: '2026-01-21T12:00:00Z',
            endTime: '2026-01-21T10:00:00Z',
          });

        expect(res.status).toBe(400);
        expect(res.body.error.message).toContain('End time must be after start time');
      });

      it('should return 409 for overlapping booking', async () => {
        // Create existing booking 10:00-12:00
        await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });

        // Try to book 11:00-13:00 (overlaps)
        const res = await request(app)
          .post('/bookings')
          .send({
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: '2026-01-21T11:00:00Z',
            endTime: '2026-01-21T13:00:00Z',
          });

        expect(res.status).toBe(409);
        expect(res.body.error.message).toBe('Room is already booked for this time slot');
      });

      it('should allow booking for different room at same time', async () => {
        const anotherRoom = await prisma.room.create({
          data: { name: 'Another Room', capacity: 5, pricePerHour: 30 },
        });

        await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });

        const res = await request(app)
          .post('/bookings')
          .send({
            userId: testUser.id,
            roomId: anotherRoom.id,
            startTime: '2026-01-21T10:00:00Z',
            endTime: '2026-01-21T12:00:00Z',
          });

        expect(res.status).toBe(201);
      });

      it('should allow booking non-overlapping time slot', async () => {
        await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });

        // Book 12:00-14:00 (adjacent, not overlapping)
        const res = await request(app)
          .post('/bookings')
          .send({
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: '2026-01-21T12:00:00Z',
            endTime: '2026-01-21T14:00:00Z',
          });

        expect(res.status).toBe(201);
      });

      it('should not allow booking in the past', async () => {
        console.log('Current mocked time:', timeUtils.getCurrentTime());
        const res = await request(app)
          .post('/bookings')
          .send({
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: '2026-01-18T10:00:00Z',
            endTime: '2026-01-18T12:00:00Z',
          });

        expect(res.status).toBe(400);
        expect(res.body.error.message).toBe('Cannot create bookings in the past');
      });
    });

    describe('PUT /bookings/:id', () => {
      it('should update booking times', async () => {
        const booking = await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });

        const res = await request(app)
          .put(`/bookings/${booking.id}`)
          .send({
            startTime: '2026-01-21T14:00:00Z',
            endTime: '2026-01-21T16:00:00Z',
          });

        expect(res.status).toBe(200);
        expect(new Date(res.body.startTime).toISOString()).toBe('2026-01-21T14:00:00.000Z');
      });

      it('should update booking status', async () => {
        const booking = await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });

        const res = await request(app)
          .put(`/bookings/${booking.id}`)
          .send({ status: 'completed' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('completed');
      });

      it('should return 404 for non-existent booking', async () => {
        const res = await request(app)
          .put('/bookings/999')
          .send({ status: 'cancelled' });

        expect(res.status).toBe(404);
      });

      it('should return 409 when update creates overlap', async () => {
        // Create two bookings
        const booking1 = await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });
        await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T14:00:00Z'),
            endTime: new Date('2026-01-21T16:00:00Z'),
          },
        });

        // Try to move booking1 to overlap with booking2
        const res = await request(app)
          .put(`/bookings/${booking1.id}`)
          .send({
            startTime: '2026-01-21T15:00:00Z',
            endTime: '2026-01-21T17:00:00Z',
          });

        expect(res.status).toBe(409);
      });
    });

    describe('DELETE /bookings/:id', () => {
      it('should delete a booking', async () => {
        const booking = await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });

        const res = await request(app).delete(`/bookings/${booking.id}`);

        expect(res.status).toBe(204);

        const deleted = await prisma.booking.findUnique({ where: { id: booking.id } });
        expect(deleted).toBeNull();
      });

      it('should return 404 for non-existent booking', async () => {
        const res = await request(app).delete('/bookings/999');

        expect(res.status).toBe(404);
      });
    });

    describe('POST /bookings/:id/cancel', () => {
      it('should cancel a booking', async () => {
        const booking = await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
          },
        });

        const res = await request(app).post(`/bookings/${booking.id}/cancel`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('cancelled');
      });

      it('should allow booking cancelled slot', async () => {
        const booking = await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-02-21T10:00:00Z'),
            endTime: new Date('2026-02-21T12:00:00Z'),
            status: 'cancelled',
          },
        });

        // Book the same slot (should work because original is cancelled)
        const res = await request(app)
          .post('/bookings')
          .send({
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: '2026-02-21T10:00:00Z',
            endTime: '2026-02-21T12:00:00Z',
          });

        expect(res.status).toBe(201);
      });

      it('should return 400 when booking already cancelled', async () => {
        const booking = await prisma.booking.create({
          data: {
            userId: testUser.id,
            roomId: testRoom.id,
            startTime: new Date('2026-01-21T10:00:00Z'),
            endTime: new Date('2026-01-21T12:00:00Z'),
            status: 'cancelled',
          },
        });

        const res = await request(app).post(`/bookings/${booking.id}/cancel`);

        expect(res.status).toBe(400);
        expect(res.body.error.message).toBe('Booking is already cancelled');
      });

      it('should return 404 for non-existent booking', async () => {
        const res = await request(app).post('/bookings/999/cancel');

        expect(res.status).toBe(404);
      });
    });
});
