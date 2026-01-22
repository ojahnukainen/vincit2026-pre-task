import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

/**
 * GET /users
 * Get all users
 */
router.get('/', userController.getAll);

/**
 * GET /users/:id
 * Get user by ID
 */
router.get('/:id', userController.getById);

/**
 * POST /users
 * Create a new user
 */
router.post('/', userController.create);

/**
 * PUT /users/:id
 * Update a user
 */
router.put('/:id', userController.update);

/**
 * DELETE /users/:id
 * Delete a user
 */
router.delete('/:id', userController.remove);

export default router;
