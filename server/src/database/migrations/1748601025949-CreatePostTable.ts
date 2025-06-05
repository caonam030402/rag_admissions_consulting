import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostTable1748601025949 implements MigrationInterface {
  name = 'CreatePostTable1748601025949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer, "guestId" character varying, "title" character varying, "isActive" boolean NOT NULL DEFAULT true, "lastMessageAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD "conversation_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD CONSTRAINT "FK_a3a9dfc39c6b353c05f77a515a5" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_3a9ae579e61e81cc0e989afeb4a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_3a9ae579e61e81cc0e989afeb4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP CONSTRAINT "FK_a3a9dfc39c6b353c05f77a515a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP COLUMN "conversation_id"`,
    );
    await queryRunner.query(`DROP TABLE "conversations"`);
  }
}
