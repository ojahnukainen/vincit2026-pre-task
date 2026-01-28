import prisma from '../utils/prisma.js';

/**
 * @typedef {Object} CreateRoomData
 * @property {string} name - Room name
 * @property {number} capacity - Room capacity
 * @property {string} keyFeatures - Key features
 */

/**
 * @typedef {Object} UpdateRoomData
 * @property {string} [name] - Room name
 * @property {number} [capacity] - Room capacity
 * @property {string} [keyFeatures] - Key features
 */

/**
 * Get all rooms
 * @returns {Promise<import('../generated/prisma').Room[]>}
 */
export const getAllRooms = async () => {
  return prisma.room.findMany({
    orderBy: { name: 'asc' },
  });
};

/**
 * Get room by ID
 * @param {number} id - Room ID
 * @returns {Promise<import('../generated/prisma').Room | null>}
 */
export const getRoomById = async (id) => {
  return prisma.room.findUnique({
    where: { id },
  });
};

/**
 * Create a new room
 * @param {CreateRoomData} data - Room data
 * @returns {Promise<import('../generated/prisma').Room>}
 */
export const createRoom = async (data) => {
  return prisma.room.create({
    data,
  });
};

/**
 * Update a room
 * @param {number} id - Room ID
 * @param {UpdateRoomData} data - Room data to update
 * @returns {Promise<import('../generated/prisma').Room>}
 */
export const updateRoom = async (id, data) => {
  return prisma.room.update({
    where: { id },
    data,
  });
};

/**
 * Delete a room
 * @param {number} id - Room ID
 * @returns {Promise<import('../generated/prisma').Room>}
 */
export const deleteRoom = async (id) => {
  return prisma.room.delete({
    where: { id },
  });
};

/**
 * Check if room exists by name
 * @param {string} name - Room name
 * @returns {Promise<import('../generated/prisma').Room | null>}
 */
export const getRoomByName = async (name) => {
  return prisma.room.findUnique({
    where: { name },
  });
};

/**
 * Get Rooms by filter
 * @param {string} filter - Filter value
 * @returns {Promise<import('../generated/prisma').Room[]>}
 */
export const getRoomsByFilter = async (filter) => {
  return prisma.room.findMany({
    where: { keyFeatures: 
      { contains: filter, mode: 'insensitive' } },
  });
};