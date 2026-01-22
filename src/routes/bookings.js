import { Router } from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router = Router();

/**
 * GET /bookings
 * Get all bookings
 */
router.get('/', bookingController.getAll);

/**
 * GET /bookings/:id
 * Get booking by ID
 */
router.get('/:id', bookingController.getById);

/**
 * POST /bookings
 * Create a new booking
 */
router.post('/', bookingController.create);

/**
 * PUT /bookings/:id
 * Update a booking
 */
router.put('/:id', bookingController.update);

/**
 * DELETE /bookings/:id
 * Delete a booking
 */
router.delete('/:id', bookingController.remove);

/**
 * POST /bookings/:id/cancel
 * Cancel a booking (soft delete)
 */
router.post('/:id/cancel', bookingController.cancel);

export default router;
