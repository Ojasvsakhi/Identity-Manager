import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authController } from './controllers/authController';
import { AppDataSource } from './data-source';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Initialize database and start server
const PORT = parseInt(process.env.PORT || '3000', 10);

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    }); 