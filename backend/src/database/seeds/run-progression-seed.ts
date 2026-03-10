import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AchievementDefinition } from '../../modules/achievements/entities/achievement-definition.entity';
import { PlayerAchievement } from '../../modules/achievements/entities/player-achievement.entity';
import { BattlePlayerResult } from '../../modules/battle-player-results/entities/battle-player-result.entity';
import { Battle } from '../../modules/battles/entities/battle.entity';
import { CampParticipation } from '../../modules/camp-participations/entities/camp-participation.entity';
import { CampTeam } from '../../modules/camp-teams/entities/camp-team.entity';
import { Camp } from '../../modules/camps/entities/camp.entity';
import { CampType } from '../../modules/camp-types/entities/camp-type.entity';
import { Duel } from '../../modules/duels/entities/duel.entity';
import { MedalDefinition } from '../../modules/medals/entities/medal-definition.entity';
import { PlayerMedal } from '../../modules/medals/entities/player-medal.entity';
import { Player } from '../../modules/players/entities/player.entity';
import { PlayerRank } from '../../modules/ranks/entities/player-rank.entity';
import { RankCategory } from '../../modules/ranks/entities/rank-category.entity';
import { RankDefinition } from '../../modules/ranks/entities/rank-definition.entity';
import { BattleParticipationScoreLedger } from '../../modules/scoring/entities/battle-participation-score-ledger.entity';
import { BattleTeamScoreLedger } from '../../modules/scoring/entities/battle-team-score-ledger.entity';
import { CampFinalizationLedger } from '../../modules/scoring/entities/camp-finalization-ledger.entity';
import { TeamAssignment } from '../../modules/team-assignments/entities/team-assignment.entity';
import { TeamTemplate } from '../../modules/team-templates/entities/team-template.entity';
import { User } from '../../modules/users/entities/user.entity';
import { seedProgression } from './progression.seed';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function run(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: requireEnv('DB_HOST'),
    port: Number(requireEnv('DB_PORT')),
    username: requireEnv('DB_USERNAME'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    entities: [
      User,
      CampType,
      TeamTemplate,
      Camp,
      Battle,
      BattlePlayerResult,
      Duel,
      CampTeam,
      CampParticipation,
      Player,
      TeamAssignment,
      BattleParticipationScoreLedger,
      BattleTeamScoreLedger,
      CampFinalizationLedger,
      RankCategory,
      RankDefinition,
      PlayerRank,
      AchievementDefinition,
      PlayerAchievement,
      MedalDefinition,
      PlayerMedal,
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    const summary = await seedProgression(dataSource);

    console.log('Progression seed completed.');
    console.log(
      `Rank categories: created=${summary.createdRankCategories}, skipped=${summary.skippedRankCategories}`,
    );
    console.log(
      `Rank definitions: created=${summary.createdRankDefinitions}, skipped=${summary.skippedRankDefinitions}`,
    );
    console.log(
      `Achievement definitions: created=${summary.createdAchievementDefinitions}, skipped=${summary.skippedAchievementDefinitions}`,
    );
    console.log(
      `Medal definitions: created=${summary.createdMedalDefinitions}, skipped=${summary.skippedMedalDefinitions}`,
    );
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed error';
  console.error(`Failed to run progression seed: ${message}`);
  process.exitCode = 1;
});
