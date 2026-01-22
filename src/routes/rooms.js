import { Router } from 'express';
import * as roomController from '../controllers/roomController.js';

const router = Router();

/**
 * GET /rooms
 * Get all rooms
 */
router.get('/', roomController.getAll);

/**
 * GET /rooms/:id
 * Get room by ID
 */
router.get('/:id', roomController.getById);

/**
 * POST /rooms
 * Create a new room
 */
router.post('/', roomController.create);

/**
 * PUT /rooms/:id
 * Update a room
 */
router.put('/:id', roomController.update);

/**
 * DELETE /rooms/:id
 * Delete a room
 */
router.delete('/:id', roomController.remove);

export default router;
