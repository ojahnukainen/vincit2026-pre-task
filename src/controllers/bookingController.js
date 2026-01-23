import { z } from 'zod';
import * as bookingService from '../services/bookingService.js';
import * as userService from '../services/userService.js';
import * as roomService from '../services/roomService.js';
import timeUtils, { getCurrentTime } from '../utils/time.js';

const dateSchema = z.string().datetime({ message: 'Invalid ISO 8601 date format' }).transform((str) => new Date(str));

const createBookingSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer'),
  roomId: z.number().int().positive('Room ID must be a positive integer'),
  startTime: dateSchema,
  endTime: dateSchema,
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

const updateBookingSchema = z.object({
  startTime: dateSchema.optional(),
  endTime: dateSchema.optional(),
  status: z.enum(['confirmed', 'cancelled', 'completed']).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

/**
 * Get all bookings
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getAll = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    res.json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Create a new booking
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const create = async (req, res, next) => {
  try {
    const data = createBookingSchema.parse(req.body);

    // Verify user exists
    const user = await userService.getUserById(data.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify room exists
    const room = await roomService.getRoomById(data.roomId);
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    // Prevent bookings in the past
    const currentTime = timeUtils.getCurrentTime();
    console.log(currentTime, data.startTime, data.endTime);
    if (data.startTime < currentTime || data.endTime < currentTime) {
      const error = new Error('Cannot create bookings in the past');
      error.statusCode = 400;
      throw error;
    }

    // Check for overlapping bookings
    const overlap = await bookingService.findOverlappingBooking(
      data.roomId,
      data.startTime,
      data.endTime
    );
    if (overlap) {
      const error = new Error('Room is already booked for this time slot');
      error.statusCode = 409;
      throw error;
    }

    const booking = await bookingService.createBooking(data);
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Update a booking
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const update = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateBookingSchema.parse(req.body);

    const existingBooking = await bookingService.getBookingById(id);
    if (!existingBooking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // If times are being updated, check for overlaps
    if (data.startTime || data.endTime) {
      const startTime = data.startTime || existingBooking.startTime;
      const endTime = data.endTime || existingBooking.endTime;

      // Validate end time is after start time
      if (endTime <= startTime) {
        const error = new Error('End time must be after start time');
        error.statusCode = 400;
        throw error;
      }

      const overlap = await bookingService.findOverlappingBooking(
        existingBooking.roomId,
        startTime,
        endTime,
        id
      );
      if (overlap) {
        const error = new Error('Room is already booked for this time slot');
        error.statusCode = 409;
        throw error;
      }
    }

    const booking = await bookingService.updateBooking(id, data);
    res.json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Delete a booking
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const existingBooking = await bookingService.getBookingById(id);
    if (!existingBooking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    await bookingService.deleteBooking(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};

/**
 * Cancel a booking
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const cancel = async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const existingBooking = await bookingService.getBookingById(id);
    if (!existingBooking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (existingBooking.status === 'cancelled') {
      const error = new Error('Booking is already cancelled');
      error.statusCode = 400;
      throw error;
    }

    const booking = await bookingService.cancelBooking(id);
    res.json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.statusCode = 400;
      error.message = error.issues.map((e) => e.message).join(', ');
    }
    next(error);
  }
};
