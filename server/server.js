import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authRoutes from './src/routes/authRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import snapshotRoutes from './src/routes/snapshotRoutes.js';
import historyRoutes from './src/routes/historyRoutes.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';
import pool from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully');
    release();
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/snapshots', snapshotRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'MacTrack API is running', status: 'OK' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`MacTrack Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});