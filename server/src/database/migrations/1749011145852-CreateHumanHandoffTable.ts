import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHumanHandoffTable1749011145852 implements MigrationInterface {
    name = 'CreateHumanHandoffTable1749011145852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."human_handoff_status_enum" AS ENUM('waiting', 'connected', 'ended', 'timeout')`);
        await queryRunner.query(`CREATE TABLE "human_handoff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversationId" character varying(255) NOT NULL, "userId" integer, "guestId" character varying(255), "adminId" integer, "status" "public"."human_handoff_status_enum" NOT NULL DEFAULT 'waiting', "initialMessage" text NOT NULL, "userProfile" jsonb, "requestedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "connectedAt" TIMESTAMP WITH TIME ZONE, "endedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8193cc9a04687198ee869761ca6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0afb4fc7d7c52b92deff276d41" ON "human_handoff" ("conversationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_000b6e0ffbb0576942d253fb7a" ON "human_handoff" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_403e2f13f904c3082635c3e2bf" ON "human_handoff" ("guestId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4158a19686688f4314abcfca53" ON "human_handoff" ("adminId") `);
        await queryRunner.query(`CREATE INDEX "IDX_070740da8bc7b2a7bdf1c6df08" ON "human_handoff" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_0899abe6affb4fb9590e6215df" ON "human_handoff" ("requestedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0899abe6affb4fb9590e6215df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_070740da8bc7b2a7bdf1c6df08"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4158a19686688f4314abcfca53"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_403e2f13f904c3082635c3e2bf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_000b6e0ffbb0576942d253fb7a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0afb4fc7d7c52b92deff276d41"`);
        await queryRunner.query(`DROP TABLE "human_handoff"`);
        await queryRunner.query(`DROP TYPE "public"."human_handoff_status_enum"`);
    }

}
