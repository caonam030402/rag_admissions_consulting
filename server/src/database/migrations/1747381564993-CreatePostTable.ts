import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostTable1747381564993 implements MigrationInterface {
    name = 'CreatePostTable1747381564993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twoFactorSecret" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isTwoFactorEnabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isTwoFactorEnabled"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twoFactorSecret"`);
    }

}
