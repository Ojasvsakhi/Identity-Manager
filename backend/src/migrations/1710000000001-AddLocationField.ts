import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationField1710000000001 implements MigrationInterface {
    name = 'AddLocationField1710000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("profiles");
        const existingColumns = table?.columns.map(col => col.name) || [];

        if (!existingColumns.includes("location")) {
            await queryRunner.query(`ALTER TABLE "profiles" ADD "location" character varying DEFAULT 'Not Specified'`);
            await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "location" SET NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("profiles");
        const existingColumns = table?.columns.map(col => col.name) || [];

        if (existingColumns.includes("location")) {
            await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "location"`);
        }
    }
} 