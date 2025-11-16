import { AppDataSource } from './data-source';

async function runMigrations() {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data Source initialized');

    // Drop existing tables first
    await AppDataSource.query(`
      DROP TABLE IF EXISTS "profiles" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
    `);
    console.log('Existing tables dropped');

    // Drop enum types if they exist
    await AppDataSource.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
          DROP TYPE "public"."users_role_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profiles_gender_enum') THEN
          DROP TYPE "public"."profiles_gender_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profiles_maritalstatus_enum') THEN
          DROP TYPE "public"."profiles_maritalstatus_enum";
        END IF;
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profiles_caste_enum') THEN
          DROP TYPE "public"."profiles_caste_enum";
        END IF;
      END $$;
    `);
    console.log('Enum types dropped');

    // Create enum types
    await AppDataSource.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM ('user', 'admin');
      CREATE TYPE "public"."profiles_gender_enum" AS ENUM ('Male', 'Female', 'Other');
      CREATE TYPE "public"."profiles_maritalstatus_enum" AS ENUM ('Single', 'Married', 'Divorced', 'Widowed');
      CREATE TYPE "public"."profiles_caste_enum" AS ENUM ('General', 'OBC', 'SC', 'ST', 'Other');
    `);
    console.log('Enum types created');

    // Synchronize the database schema
    await AppDataSource.synchronize();
    console.log('Database schema has been synchronized successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

runMigrations(); 