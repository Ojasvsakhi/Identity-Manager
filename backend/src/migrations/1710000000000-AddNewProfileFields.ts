import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewProfileFields1710000000000 implements MigrationInterface {
    name = 'AddNewProfileFields1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types first
        await queryRunner.query(`CREATE TYPE "public"."profiles_gender_enum" AS ENUM('Male', 'Female', 'Other')`);
        await queryRunner.query(`CREATE TYPE "public"."profiles_maritalstatus_enum" AS ENUM('Single', 'Married', 'Divorced', 'Widowed')`);
        await queryRunner.query(`CREATE TYPE "public"."profiles_caste_enum" AS ENUM('General', 'OBC', 'SC', 'ST', 'Other')`);

        // Check and add columns if they don't exist
        const table = await queryRunner.getTable("profiles");
        const existingColumns = table?.columns.map(col => col.name) || [];

        if (!existingColumns.includes("age")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "age" character varying DEFAULT '0'`);
        }
        if (!existingColumns.includes("gender")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "gender" "public"."profiles_gender_enum" DEFAULT 'Other'`);
        }
        if (!existingColumns.includes("maritalStatus")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "maritalStatus" "public"."profiles_maritalstatus_enum" DEFAULT 'Single'`);
        }
        if (!existingColumns.includes("caste")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "caste" "public"."profiles_caste_enum" DEFAULT 'General'`);
        }
        if (!existingColumns.includes("education")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "education" character varying DEFAULT 'Not Specified'`);
        }
        if (!existingColumns.includes("occupation")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "occupation" character varying DEFAULT 'Not Specified'`);
        }
        if (!existingColumns.includes("contact")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "contact" character varying DEFAULT 'Not Specified'`);
        }
        if (!existingColumns.includes("notes")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "notes" character varying`);
        }

        // Make columns NOT NULL if they aren't already
        const columns = table?.columns || [];
        if (!columns.find(col => col.name === "age")?.isNullable) {
            await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "age" SET NOT NULL`);
        }
        if (!columns.find(col => col.name === "gender")?.isNullable) {
            await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "gender" SET NOT NULL`);
        }
        if (!columns.find(col => col.name === "maritalStatus")?.isNullable) {
            await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "maritalStatus" SET NOT NULL`);
        }
        if (!columns.find(col => col.name === "caste")?.isNullable) {
            await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "caste" SET NOT NULL`);
        }
        if (!columns.find(col => col.name === "education")?.isNullable) {
            await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "education" SET NOT NULL`);
        }
        if (!columns.find(col => col.name === "occupation")?.isNullable) {
            await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "occupation" SET NOT NULL`);
        }
        if (!columns.find(col => col.name === "contact")?.isNullable) {
            await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "contact" SET NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns if they exist
        const table = await queryRunner.getTable("profiles");
        const existingColumns = table?.columns.map(col => col.name) || [];

        if (existingColumns.includes("notes")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "notes"`);
        }
        if (existingColumns.includes("contact")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "contact"`);
        }
        if (existingColumns.includes("occupation")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "occupation"`);
        }
        if (existingColumns.includes("education")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "education"`);
        }
        if (existingColumns.includes("caste")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "caste"`);
        }
        if (existingColumns.includes("maritalStatus")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "maritalStatus"`);
        }
        if (existingColumns.includes("gender")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "gender"`);
        }
        if (existingColumns.includes("age")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "age"`);
        }

        // Drop enum types
        await queryRunner.query(`DROP TYPE "public"."profiles_caste_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profiles_maritalstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profiles_gender_enum"`);
    }
} 