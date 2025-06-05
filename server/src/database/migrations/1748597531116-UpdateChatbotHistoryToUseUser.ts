import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateChatbotHistoryToUseUser1748597531116
  implements MigrationInterface
{
  name = 'UpdateChatbotHistoryToUseUser1748597531116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP CONSTRAINT "FK_89bfc009b8ccc30edfcd1abd7c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP COLUMN "chatbot_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD "userId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD "guestId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD "title" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD "user_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD CONSTRAINT "FK_8cab448d1f11638b57c290f5051" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP CONSTRAINT "FK_8cab448d1f11638b57c290f5051"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP COLUMN "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP COLUMN "title"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP COLUMN "guestId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP COLUMN "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD "chatbot_user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD CONSTRAINT "FK_89bfc009b8ccc30edfcd1abd7c5" FOREIGN KEY ("chatbot_user_id") REFERENCES "chatbot_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
