import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostTable1748587639356 implements MigrationInterface {
    name = 'CreatePostTable1748587639356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chatbot_history" DROP CONSTRAINT "FK_b6fc1650533f2b27bebe5f606d4"`);
        await queryRunner.query(`ALTER TABLE "chatbot_history" DROP COLUMN "conversation_topic_id"`);
        await queryRunner.query(`ALTER TABLE "chatbot_user" DROP CONSTRAINT "UQ_7a0cffb67d5ee73e43ca3ec83dc"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chatbot_user" ADD CONSTRAINT "UQ_7a0cffb67d5ee73e43ca3ec83dc" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "chatbot_history" ADD "conversation_topic_id" uuid`);
        await queryRunner.query(`ALTER TABLE "chatbot_history" ADD CONSTRAINT "FK_b6fc1650533f2b27bebe5f606d4" FOREIGN KEY ("conversation_topic_id") REFERENCES "conversation_topics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
