import { DataSourceOptions } from "typeorm";
import { User } from "../entities/User";
import { Profile } from "../entities/Profile";
import { Message } from "../entities/Message";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const typeormConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "profile_management",
    synchronize: true,
    logging: true,
    entities: [User, Profile, Message],
    migrations: [path.join(__dirname, "../migrations/*.{ts,js}")],
    subscribers: [],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}; 