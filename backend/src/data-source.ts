import "reflect-metadata";
import { DataSource } from "typeorm";
import { typeormConfig } from "./config/typeorm.config";

export const AppDataSource = new DataSource(typeormConfig);

// Initialize the database connection
let initialized = false;

export const initializeDatabase = async () => {
    if (!initialized) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
                console.log("Data Source has been initialized!");
            }
            initialized = true;
        } catch (error) {
            console.error("Error during Data Source initialization:", error);
            throw error;
        }
    }
    return AppDataSource;
}; 