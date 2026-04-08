import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedProgression } from '../seeds/progression.seed';
import { seedSuperAdmin } from '../seeds/super-admin.seed';

@Injectable()
export class DatabaseBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseBootstrapService.name);
  private hasRun = false;

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.hasRun) {
      return;
    }

    this.hasRun = true;

    try {
      if (!this.dataSource.isInitialized) {
        this.logger.warn('DataSource is not initialized. Skipping DB bootstrap.');
        return;
      }

      this.logger.log('Starting database bootstrap...');

      const superAdminResult = await seedSuperAdmin(this.dataSource);
      this.logger.log(`SUPER_ADMIN seed result: ${superAdminResult}`);

      const progressionSummary = await seedProgression(this.dataSource);
      this.logger.log(
        `Progression seed completed. ` +
          `Rank categories created=${progressionSummary.createdRankCategories}, skipped=${progressionSummary.skippedRankCategories}; ` +
          `Rank definitions created=${progressionSummary.createdRankDefinitions}, skipped=${progressionSummary.skippedRankDefinitions}; ` +
          `Achievement definitions created=${progressionSummary.createdAchievementDefinitions}, skipped=${progressionSummary.skippedAchievementDefinitions}; ` +
          `Medal definitions created=${progressionSummary.createdMedalDefinitions}, skipped=${progressionSummary.skippedMedalDefinitions}`,
      );

      this.logger.log('Database bootstrap completed successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown bootstrap error';
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Database bootstrap failed: ${message}`, stack);

      throw error;
    }
  }
}