import express from 'express';
import healthRoutes from './routes/health.js';
import userRoutes from './routes/users.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/bookings', bookingRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
