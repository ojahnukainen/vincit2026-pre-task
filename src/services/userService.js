import prisma from '../utils/prisma.js';

/**
 * @typedef {Object} CreateUserData
 * @property {string} email - User email
 * @property {string} name - User name
 */

/**
 * @typedef {Object} UpdateUserData
 * @property {string} [email] - User email
 * @property {string} [name] - User name
 */

/**
 * Get all users
 * @returns {Promise<import('../generated/prisma').User[]>}
 */
export const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<import('../generated/prisma').User | null>}
 */
export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Create a new user
 * @param {CreateUserData} data - User data
 * @returns {Promise<import('../generated/prisma').User>}
 */
export const createUser = async (data) => {
  return prisma.user.create({
    data,
  });
};

/**
 * Update a user
 * @param {number} id - User ID
 * @param {UpdateUserData} data - User data to update
 * @returns {Promise<import('../generated/prisma').User>}
 */
export const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {Promise<import('../generated/prisma').User>}
 */
export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id },
  });
};

/**
 * Check if user exists by email
 * @param {string} email - User email
 * @returns {Promise<import('../generated/prisma').User | null>}
 */
export const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};
