import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnalyticsTable1749395341680 implements MigrationInterface {
    name = 'CreateAnalyticsTable1749395341680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "human_handoff_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentAlias" character varying(100) NOT NULL DEFAULT 'Agent', "triggerPattern" text NOT NULL DEFAULT 'support,help,agent', "timezone" character varying(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh', "workingDays" json NOT NULL DEFAULT '["monday","tuesday","wednesday","thursday","friday"]', "workingHours" jsonb NOT NULL DEFAULT '{}', "isEnabled" boolean NOT NULL DEFAULT true, "timeoutDuration" integer NOT NULL DEFAULT '60', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05a5a49987683d380f3f2065be1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f240ccca69f74c3975602f473b" ON "human_handoff_setting" ("agentAlias") `);
        await queryRunner.query(`CREATE TYPE "public"."analytics_eventtype_enum" AS ENUM('conversation_started', 'message_sent', 'message_received', 'human_handoff_requested', 'human_handoff_connected', 'conversation_ended', 'user_feedback', 'response_generated', 'document_retrieved', 'error_occurred')`);
        await queryRunner.query(`CREATE TABLE "analytics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventType" "public"."analytics_eventtype_enum" NOT NULL, "conversationId" uuid, "userId" integer, "guestId" character varying, "sessionId" character varying, "messageContent" text, "metadata" jsonb, "userAgent" character varying, "ipAddress" inet, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3c96dcbf1e4c57ea9e0c3144bff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_580113523c22b64e52ef425d50" ON "analytics" ("eventType") `);
        await queryRunner.query(`CREATE INDEX "IDX_9c3efeb45f41ac85500883a604" ON "analytics" ("conversationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a150437ec0be6ce6aaad3f374e" ON "analytics" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fd25b1289e6306df12dd358ef9" ON "analytics" ("guestId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7439e9bec6e0828a17fb92b1e0" ON "analytics" ("createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7439e9bec6e0828a17fb92b1e0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd25b1289e6306df12dd358ef9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a150437ec0be6ce6aaad3f374e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9c3efeb45f41ac85500883a604"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_580113523c22b64e52ef425d50"`);
        await queryRunner.query(`DROP TABLE "analytics"`);
        await queryRunner.query(`DROP TYPE "public"."analytics_eventtype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f240ccca69f74c3975602f473b"`);
        await queryRunner.query(`DROP TABLE "human_handoff_setting"`);
    }

}
