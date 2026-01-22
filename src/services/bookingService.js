import prisma from '../utils/prisma.js';

/**
 * @typedef {Object} CreateBookingData
 * @property {number} userId - User ID
 * @property {number} roomId - Room ID
 * @property {Date} startTime - Booking start time (UTC)
 * @property {Date} endTime - Booking end time (UTC)
 */

/**
 * @typedef {Object} UpdateBookingData
 * @property {Date} [startTime] - Booking start time (UTC)
 * @property {Date} [endTime] - Booking end time (UTC)
 * @property {string} [status] - Booking status
 */

/**
 * Get all bookings
 * @returns {Promise<import('../generated/prisma').Booking[]>}
 */
export const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      user: true,
      room: true,
    },
    orderBy: { startTime: 'asc' },
  });
};

/**
 * Get booking by ID
 * @param {number} id - Booking ID
 * @returns {Promise<import('../generated/prisma').Booking | null>}
 */
export const getBookingById = async (id) => {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      room: true,
    },
  });
};

/**
 * Get bookings by room ID
 * @param {number} roomId - Room ID
 * @returns {Promise<import('../generated/prisma').Booking[]>}
 */
export const getBookingsByRoomId = async (roomId) => {
  return prisma.booking.findMany({
    where: { roomId },
    include: {
      user: true,
      room: true,
    },
    orderBy: { startTime: 'asc' },
  });
};

/**
 * Get bookings by user ID
 * @param {number} userId - User ID
 * @returns {Promise<import('../generated/prisma').Booking[]>}
 */
export const getBookingsByUserId = async (userId) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      user: true,
      room: true,
    },
    orderBy: { startTime: 'asc' },
  });
};

/**
 * Check for overlapping bookings for a room
 * @param {number} roomId - Room ID
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @param {number} [excludeBookingId] - Booking ID to exclude (for updates)
 * @returns {Promise<import('../generated/prisma').Booking | null>}
 */
export const findOverlappingBooking = async (roomId, startTime, endTime, excludeBookingId = null) => {
  const where = {
    roomId,
    status: { not: 'cancelled' },
    OR: [
      // New booking starts during existing booking
      {
        startTime: { lte: startTime },
        endTime: { gt: startTime },
      },
      // New booking ends during existing booking
      {
        startTime: { lt: endTime },
        endTime: { gte: endTime },
      },
      // New booking completely contains existing booking
      {
        startTime: { gte: startTime },
        endTime: { lte: endTime },
      },
    ],
  };

  if (excludeBookingId) {
    where.id = { not: excludeBookingId };
  }

  return prisma.booking.findFirst({ where });
};

/**
 * Create a new booking
 * @param {CreateBookingData} data - Booking data
 * @returns {Promise<import('../generated/prisma').Booking>}
 */
export const createBooking = async (data) => {
  return prisma.booking.create({
    data,
    include: {
      user: true,
      room: true,
    },
  });
};

/**
 * Update a booking
 * @param {number} id - Booking ID
 * @param {UpdateBookingData} data - Booking data to update
 * @returns {Promise<import('../generated/prisma').Booking>}
 */
export const updateBooking = async (id, data) => {
  return prisma.booking.update({
    where: { id },
    data,
    include: {
      user: true,
      room: true,
    },
  });
};

/**
 * Delete a booking
 * @param {number} id - Booking ID
 * @returns {Promise<import('../generated/prisma').Booking>}
 */
export const deleteBooking = async (id) => {
  return prisma.booking.delete({
    where: { id },
  });
};

/**
 * Cancel a booking (soft delete by changing status)
 * @param {number} id - Booking ID
 * @returns {Promise<import('../generated/prisma').Booking>}
 */
export const cancelBooking = async (id) => {
  return prisma.booking.update({
    where: { id },
    data: { status: 'cancelled' },
    include: {
      user: true,
      room: true,
    },
  });
};
