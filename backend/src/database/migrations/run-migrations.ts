import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { BattlePlayerResult } from '../../modules/battle-player-results/entities/battle-player-result.entity';
import { Battle } from '../../modules/battles/entities/battle.entity';
import { Duel } from '../../modules/duels/entities/duel.entity';
import { CampTeam } from '../../modules/camp-teams/entities/camp-team.entity';
import { CampParticipation } from '../../modules/camp-participations/entities/camp-participation.entity';
import { Camp } from '../../modules/camps/entities/camp.entity';
import { CampType } from '../../modules/camp-types/entities/camp-type.entity';
import { Player } from '../../modules/players/entities/player.entity';
import { TeamAssignment } from '../../modules/team-assignments/entities/team-assignment.entity';
import { TeamTemplate } from '../../modules/team-templates/entities/team-template.entity';
import { User } from '../../modules/users/entities/user.entity';
import { BattleParticipationScoreLedger } from '../../modules/scoring/entities/battle-participation-score-ledger.entity';
import { BattleTeamScoreLedger } from '../../modules/scoring/entities/battle-team-score-ledger.entity';
import { CampFinalizationLedger } from '../../modules/scoring/entities/camp-finalization-ledger.entity';
import { PlayerRank } from '../../modules/ranks/entities/player-rank.entity';
import { RankCategory } from '../../modules/ranks/entities/rank-category.entity';
import { RankDefinition } from '../../modules/ranks/entities/rank-definition.entity';
import { AchievementDefinition } from '../../modules/achievements/entities/achievement-definition.entity';
import { PlayerAchievement } from '../../modules/achievements/entities/player-achievement.entity';
import { MedalDefinition } from '../../modules/medals/entities/medal-definition.entity';
import { PlayerMedal } from '../../modules/medals/entities/player-medal.entity';
import { Photo } from '../../modules/photos/entities/photo.entity';
import { CreateUsersTable1710000000000 } from './1710000000000-create-users-table';
import { CreateCampTypesTable1720000000000 } from './1720000000000-create-camp-types-table';
import { CreateTeamTemplatesTable1730000000000 } from './1730000000000-create-team-templates-table';
import { CreateCampsTable1740000000000 } from './1740000000000-create-camps-table';
import { CreateCampTeamsTable1750000000000 } from './1750000000000-create-camp-teams-table';
import { CreatePlayersTable1760000000000 } from './1760000000000-create-players-table';
import { CreateCampParticipationsTable1770000000000 } from './1770000000000-create-camp-participations-table';
import { CreateTeamAssignmentsTable1780000000000 } from './1780000000000-create-team-assignments-table';
import { CreateBattlesTable1790000000000 } from './1790000000000-create-battles-table';
import { CreateBattlePlayerResultsTable1800000000000 } from './1800000000000-create-battle-player-results-table';
import { CreateDuelsTable1810000000000 } from './1810000000000-create-duels-table';
import { CreateBattleScoreLedgerTables1820000000000 } from './1820000000000-create-battle-score-ledger-tables';
import { CreateCampFinalizationLedgerTable1830000000000 } from './1830000000000-create-camp-finalization-ledger-table';
import { CreateRanksTables1840000000000 } from './1840000000000-create-ranks-tables';
import { CreateAchievementsTables1850000000000 } from './1850000000000-create-achievements-tables';
import { CreateMedalsTables1860000000000 } from './1860000000000-create-medals-tables';
import { CreatePhotosTable1870000000000 } from './1870000000000-create-photos-table';

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
      Photo,
    ],
    migrations: [
      CreateUsersTable1710000000000,
      CreateCampTypesTable1720000000000,
      CreateTeamTemplatesTable1730000000000,
      CreateCampsTable1740000000000,
      CreateCampTeamsTable1750000000000,
      CreatePlayersTable1760000000000,
      CreateCampParticipationsTable1770000000000,
      CreateTeamAssignmentsTable1780000000000,
      CreateBattlesTable1790000000000,
      CreateBattlePlayerResultsTable1800000000000,
      CreateDuelsTable1810000000000,
      CreateBattleScoreLedgerTables1820000000000,
      CreateCampFinalizationLedgerTable1830000000000,
      CreateRanksTables1840000000000,
      CreateAchievementsTables1850000000000,
      CreateMedalsTables1860000000000,
      CreatePhotosTable1870000000000,
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    const migrations = await dataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    console.log(`Applied ${migrations.length} migration(s).`);
    for (const migration of migrations) {
      console.log(`- ${migration.name}`);
    }
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown migration error';
  console.error(`Failed to run migrations: ${message}`);
  process.exitCode = 1;
});
