import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostTable1747535522881 implements MigrationInterface {
  name = 'CreatePostTable1747535522881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."chatbot_history_role_enum" AS ENUM('user', 'assistant', 'system')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chatbot_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversationId" uuid NOT NULL, "role" "public"."chatbot_history_role_enum" NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "chatbot_user_id" uuid, CONSTRAINT "PK_ef70974d1acec27826b56ab9b87" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chatbot_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7bf419f59ca470a3f438eada0e3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chatbot" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1ee1961e62c5cec278314f1d68e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" ADD CONSTRAINT "FK_89bfc009b8ccc30edfcd1abd7c5" FOREIGN KEY ("chatbot_user_id") REFERENCES "chatbot_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot_history" DROP CONSTRAINT "FK_89bfc009b8ccc30edfcd1abd7c5"`,
    );
    await queryRunner.query(`DROP TABLE "chatbot"`);
    await queryRunner.query(`DROP TABLE "chatbot_user"`);
    await queryRunner.query(`DROP TABLE "chatbot_history"`);
    await queryRunner.query(`DROP TYPE "public"."chatbot_history_role_enum"`);
  }
}
