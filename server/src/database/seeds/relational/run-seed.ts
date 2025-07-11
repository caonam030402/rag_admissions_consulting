import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { ChatbotConfigSeedService } from './chatbot-config/chatbot-config-seed.service';
import { AnalyticsSeedService } from './analytics/analytics-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(ChatbotConfigSeedService).run();
  await app.get(AnalyticsSeedService).run();
  await app.close();
};

void runSeed();
