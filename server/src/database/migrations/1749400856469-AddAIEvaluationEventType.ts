import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAIEvaluationEventType1749400856469 implements MigrationInterface {
    name = 'AddAIEvaluationEventType1749400856469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."analytics_eventtype_enum" RENAME TO "analytics_eventtype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."analytics_eventtype_enum" AS ENUM('conversation_started', 'message_sent', 'message_received', 'human_handoff_requested', 'human_handoff_connected', 'conversation_ended', 'user_feedback', 'response_generated', 'document_retrieved', 'error_occurred', 'ai_evaluation')`);
        await queryRunner.query(`ALTER TABLE "analytics" ALTER COLUMN "eventType" TYPE "public"."analytics_eventtype_enum" USING "eventType"::"text"::"public"."analytics_eventtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."analytics_eventtype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."analytics_eventtype_enum_old" AS ENUM('conversation_started', 'message_sent', 'message_received', 'human_handoff_requested', 'human_handoff_connected', 'conversation_ended', 'user_feedback', 'response_generated', 'document_retrieved', 'error_occurred')`);
        await queryRunner.query(`ALTER TABLE "analytics" ALTER COLUMN "eventType" TYPE "public"."analytics_eventtype_enum_old" USING "eventType"::"text"::"public"."analytics_eventtype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."analytics_eventtype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."analytics_eventtype_enum_old" RENAME TO "analytics_eventtype_enum"`);
    }

}
