import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateHumanHandoffSettings1748760000000
  implements MigrationInterface
{
  name = 'UpdateHumanHandoffSettings1748760000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing chatbot_configs records to include new humanHandoff fields
    const defaultHumanHandoff = {
      enabled: false,
      agentAlias: 'Agent',
      triggerPattern: 'support,help,agent',
      timezone: 'Asia/Ho_Chi_Minh',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: {
        monday: { start: '09:00', end: '18:00', hours: '9 hrs' },
        tuesday: { start: '09:00', end: '18:00', hours: '9 hrs' },
        wednesday: { start: '09:00', end: '18:00', hours: '9 hrs' },
        thursday: { start: '09:00', end: '18:00', hours: '9 hrs' },
        friday: { start: '09:00', end: '18:00', hours: '9 hrs' },
      },
      timeoutDuration: 60,
      maxWaitTime: 30,
      showEscalationButton: true,
      escalationButtonText: 'Talk to human agent',
    };

    // Get all existing records
    const existingConfigs = await queryRunner.query(`
      SELECT id, "humanHandoff" FROM chatbot_configs
    `);

    // Update each record to merge with new fields
    for (const config of existingConfigs) {
      const currentHumanHandoff = config.humanHandoff || {};
      const updatedHumanHandoff = {
        ...defaultHumanHandoff,
        ...currentHumanHandoff,
      };

      await queryRunner.query(
        `UPDATE chatbot_configs SET "humanHandoff" = $1 WHERE id = $2`,
        [JSON.stringify(updatedHumanHandoff), config.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to old humanHandoff structure (remove new fields)
    const existingConfigs = await queryRunner.query(`
      SELECT id, "humanHandoff" FROM chatbot_configs
    `);

    for (const config of existingConfigs) {
      const currentHumanHandoff = config.humanHandoff || {};
      const revertedHumanHandoff = {
        enabled: currentHumanHandoff.enabled || false,
        maxWaitTime: currentHumanHandoff.maxWaitTime || 30,
        showEscalationButton: currentHumanHandoff.showEscalationButton || true,
        escalationButtonText:
          currentHumanHandoff.escalationButtonText || 'Talk to human agent',
        triggerKeywords: currentHumanHandoff.triggerKeywords,
        agentAvailableMessage: currentHumanHandoff.agentAvailableMessage,
        agentUnavailableMessage: currentHumanHandoff.agentUnavailableMessage,
      };

      await queryRunner.query(
        `UPDATE chatbot_configs SET "humanHandoff" = $1 WHERE id = $2`,
        [JSON.stringify(revertedHumanHandoff), config.id],
      );
    }
  }
}
