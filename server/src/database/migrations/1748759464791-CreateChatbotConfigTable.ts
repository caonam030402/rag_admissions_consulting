import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatbotConfigTable1748759464791
  implements MigrationInterface
{
  name = 'CreateChatbotConfigTable1748759464791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "config"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "version"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "llmConfig" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "chatConfig" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "personality" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "appearance" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "welcomeSettings" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "humanHandoff" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "contactInfo" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "environment" character varying NOT NULL DEFAULT 'development'`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "debug" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."chatbot_configs_type_enum" RENAME TO "chatbot_configs_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chatbot_configs_type_enum" AS ENUM('default', 'override')`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ALTER COLUMN "type" TYPE "public"."chatbot_configs_type_enum" USING "type"::"text"::"public"."chatbot_configs_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ALTER COLUMN "type" SET DEFAULT 'default'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."chatbot_configs_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP CONSTRAINT "UQ_b427f51068cd2ddafbcba16261b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ALTER COLUMN "type" SET DEFAULT 'default'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD CONSTRAINT "UQ_b427f51068cd2ddafbcba16261b" UNIQUE ("type")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chatbot_configs_type_enum_old" AS ENUM('basic_info', 'appearance', 'welcome_setting', 'human_handoff', 'rag_settings')`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ALTER COLUMN "type" TYPE "public"."chatbot_configs_type_enum_old" USING "type"::"text"::"public"."chatbot_configs_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."chatbot_configs_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."chatbot_configs_type_enum_old" RENAME TO "chatbot_configs_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "debug"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "environment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "contactInfo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "humanHandoff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "welcomeSettings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "appearance"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "personality"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "chatConfig"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" DROP COLUMN "llmConfig"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "version" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot_configs" ADD "config" jsonb NOT NULL`,
    );
  }
}
