import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

describe('User Endpoints', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.booking.deleteMany();
    await prisma.user.deleteMany();
    await prisma.room.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /users', () => {
    it('should return empty array when no users exist', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all users', async () => {
      await prisma.user.createMany({
        data: [
          { email: 'user1@example.com', name: 'User One' },
          { email: 'user2@example.com', name: 'User Two' },
        ],
      });

      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const user = await prisma.user.create({
        data: { email: 'test@example.com', name: 'Test User' },
      });

      const res = await request(app).get(`/users/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.name).toBe('Test User');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/users/999');

      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('User not found');
    });

    it('should return 400 for invalid ID', async () => {
      const res = await request(app).get('/users/invalid');

      expect(res.status).toBe(400);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'new@example.com', name: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('new@example.com');
      expect(res.body.name).toBe('New User');
      expect(res.body.id).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'invalid-email', name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Invalid email');
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      await prisma.user.create({
        data: { email: 'existing@example.com', name: 'Existing' },
      });

      const res = await request(app)
        .post('/users')
        .send({ email: 'existing@example.com', name: 'Duplicate' });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toBe('Email already in use');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const user = await prisma.user.create({
        data: { email: 'test@example.com', name: 'Original Name' },
      });

      const res = await request(app)
        .put(`/users/${user.id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
      expect(res.body.email).toBe('test@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .put('/users/999')
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should return 409 for duplicate email on update', async () => {
      await prisma.user.create({
        data: { email: 'existing@example.com', name: 'Existing' },
      });
      const user = await prisma.user.create({
        data: { email: 'test@example.com', name: 'Test' },
      });

      const res = await request(app)
        .put(`/users/${user.id}`)
        .send({ email: 'existing@example.com' });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = await prisma.user.create({
        data: { email: 'delete@example.com', name: 'Delete Me' },
      });

      const res = await request(app).delete(`/users/${user.id}`);

      expect(res.status).toBe(204);

      // Verify deletion
      const deleted = await prisma.user.findUnique({ where: { id: user.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).delete('/users/999');

      expect(res.status).toBe(404);
    });
  });
});
