import { z } from 'zod';
import * as userService from '../services/userService.js';

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name cannot be empty').optional(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

/**
 * Get all users
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const user = await userService.getUserById(id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Create a new user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const create = async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existingUser = await userService.getUserByEmail(data.email);
    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 409;
      throw error;
    }

    const user = await userService.createUser(data);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Update a user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const update = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateUserSchema.parse(req.body);

    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await userService.getUserByEmail(data.email);
      if (emailInUse) {
        const error = new Error('Email already in use');
        error.statusCode = 409;
        throw error;
      }
    }

    const user = await userService.updateUser(id, data);
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Delete a user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};
