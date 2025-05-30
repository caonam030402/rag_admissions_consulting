import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropChatbotUserTable1748597531117 implements MigrationInterface {
  name = 'DropChatbotUserTable1748597531117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "chatbot_user"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chatbot_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7bf419f59ca470a3f438eada0e3" PRIMARY KEY ("id"))`,
    );
  }
}
