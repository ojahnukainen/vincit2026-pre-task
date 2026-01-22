import { z } from 'zod';
import * as roomService from '../services/roomService.js';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  pricePerHour: z.number().positive('Price per hour must be positive'),
});

const updateRoomSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  capacity: z.number().int().positive('Capacity must be a positive integer').optional(),
  pricePerHour: z.number().positive('Price per hour must be positive').optional(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

/**
 * Get all rooms
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getAll = async (req, res, next) => {
  try {
    const rooms = await roomService.getAllRooms();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

/**
 * Get room by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const room = await roomService.getRoomById(id);

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    res.json(room);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Create a new room
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const create = async (req, res, next) => {
  try {
    const data = createRoomSchema.parse(req.body);

    const existingRoom = await roomService.getRoomByName(data.name);
    if (existingRoom) {
      const error = new Error('Room name already exists');
      error.statusCode = 409;
      throw error;
    }

    const room = await roomService.createRoom(data);
    res.status(201).json(room);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Update a room
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const update = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateRoomSchema.parse(req.body);

    const existingRoom = await roomService.getRoomById(id);
    if (!existingRoom) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.name && data.name !== existingRoom.name) {
      const nameInUse = await roomService.getRoomByName(data.name);
      if (nameInUse) {
        const error = new Error('Room name already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const room = await roomService.updateRoom(id, data);
    res.json(room);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Delete a room
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const existingRoom = await roomService.getRoomById(id);
    if (!existingRoom) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    await roomService.deleteRoom(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};
