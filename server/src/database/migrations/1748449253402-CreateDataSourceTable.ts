import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDataSourceTable1748449253402 implements MigrationInterface {
  name = 'CreateDataSourceTable1748449253402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."data_source_type_enum" AS ENUM('web_crawl', 'file_upload', 'api_import', 'manual_input')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."data_source_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(500) NOT NULL, "description" text, "type" "public"."data_source_type_enum" NOT NULL, "sourceUrl" character varying(2000), "filePath" character varying(1000), "status" "public"."data_source_status_enum" NOT NULL DEFAULT 'pending', "documentsCount" integer NOT NULL DEFAULT '0', "vectorsCount" integer NOT NULL DEFAULT '0', "uploadedBy" character varying(100) NOT NULL, "uploaderEmail" character varying(255) NOT NULL, "processingStartedAt" TIMESTAMP WITH TIME ZONE, "processingCompletedAt" TIMESTAMP WITH TIME ZONE, "errorMessage" text, "metadata" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9775f6b6312a926ed37d3af7d95" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "data_source"`);
    await queryRunner.query(`DROP TYPE "public"."data_source_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."data_source_type_enum"`);
  }
}
