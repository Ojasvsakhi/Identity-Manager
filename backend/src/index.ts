import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import profileRoutes from './routes/profileRoutes';
import userRoutes from './routes/userRoutes';
import { authController } from './controllers/authController';
import { profileController } from './controllers/profileController';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors({
  origin: ['http://localhost', 'http://localhost:3000', 'http://localhost:80','http://localhost:3002'], // Allow frontend to access
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Attach data source to app for controller access
app.set('dataSource', AppDataSource);

// Routes
app.use('/api', userRoutes);
app.use('/api/profiles', profileRoutes);
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Initialize TypeORM
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established');
    
    // Try to start the server on the specified port
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        const nextPort = PORT + 1;
        console.log(`Port ${PORT} is in use, trying port ${nextPort}`);
        app.listen(nextPort, () => {
          console.log(`Server is running on port ${nextPort}`);
        });
      } else {
        console.error('Server error:', error);
      }
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error);
  }); 