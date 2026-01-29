import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

describe('Room Endpoints', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.user.deleteMany();
    await prisma.room.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /rooms', () => {
    it('should return empty array when no rooms exist', async () => {
      const res = await request(app).get('/rooms');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all rooms sorted by name', async () => {
      await prisma.room.createMany({
        data: [
          { name: 'Room B', capacity: 10, keyFeatures: '[Projector, Sound System]' },
          { name: 'Room A', capacity: 5, keyFeatures: '[Whiteboard]' },
        ],
      });

      const res = await request(app).get('/rooms');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Room A');
      expect(res.body[1].name).toBe('Room B');
    });
  });

  describe('GET /rooms/:id', () => {
    it('should return a room by ID', async () => {
      const room = await prisma.room.create({
        data: { name: 'Test Room', capacity: 10, keyFeatures: '[Whiteboard]' },
      });

      const res = await request(app).get(`/rooms/${room.id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Room');
      expect(res.body.capacity).toBe(10);
      expect(res.body.keyFeatures).toBe('[Whiteboard]');
    });

    it('should return 404 for non-existent room', async () => {
      const res = await request(app).get('/rooms/999');

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Room not found');
    });
  });

  describe('POST /rooms', () => {
    it('should create a new room', async () => {
      const res = await request(app)
        .post('/rooms')
        .send({ name: 'Conference Room', capacity: 20, keyFeatures: '[Projector, Video Conferencing]' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Conference Room');
      expect(res.body.capacity).toBe(20);
      expect(res.body.keyFeatures).toBe('[Projector, Video Conferencing]');
      expect(res.body.id).toBeDefined();
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/rooms')
        .send({ capacity: 10 });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid capacity', async () => {
      const res = await request(app)
        .post('/rooms')
        .send({ name: 'Test', capacity: -5 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('positive');
    });

    it('should return 409 for duplicate room name', async () => {
      await prisma.room.create({
        data: { name: 'Existing Room', capacity: 10, keyFeatures: '[Projector]' },
      });

      const res = await request(app)
        .post('/rooms')
        .send({ name: 'Existing Room', capacity: 10, keyFeatures: '[Projector]' });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toBe('Room name already exists');
    });
  });

  describe('PUT /rooms/:id', () => {
    it('should update an existing room', async () => {
      const room =await prisma.room.create({
        data: { name: 'Movie Room', capacity: 20, keyFeatures: '[Projector]' },
      });

      const res = await request(app)
      .put(`/rooms/${room.id}`)
      .send({ keyFeatures: '[Projector, Playstation 5, Dolby Atmos]' });
      
      expect(res.status).toBe(200);
      expect(res.body.keyFeatures).toBe('[Projector, Playstation 5, Dolby Atmos]');
    });
    it('should return 404 for non-existent room', async () => {
      const res = await request(app)
        .put('/rooms/999')
        .send({ capacity: 15 });

      expect(res.status).toBe(404);
    });

    it('should return 409 for duplicate name on update', async () => {
      await prisma.room.create({
        data: { name: 'Existing Room', capacity: 10, keyFeatures: '[Projector]' },
      });
      const room = await prisma.room.create({
        data: { name: 'Test Room', capacity: 5, keyFeatures: '[Whiteboard]' },
      });

      const res = await request(app)
        .put(`/rooms/${room.id}`)
        .send({ name: 'Existing Room' });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /rooms/:id', () => {
    it('should delete a room', async () => {
      const room = await prisma.room.create({
        data: { name: 'Delete Room', capacity: 10, keyFeatures: '[Projector]' },
      });

      const res = await request(app).delete(`/rooms/${room.id}`);

      expect(res.status).toBe(204);

      const deleted = await prisma.room.findUnique({ where: { id: room.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent room', async () => {
      const res = await request(app).delete('/rooms/999');

      expect(res.status).toBe(404);
    });
  });
});
