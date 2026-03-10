import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Battle } from '../../modules/battles/entities/battle.entity';
import { CampTeam } from '../../modules/camp-teams/entities/camp-team.entity';
import { CampParticipation } from '../../modules/camp-participations/entities/camp-participation.entity';
import { Camp } from '../../modules/camps/entities/camp.entity';
import { CampType } from '../../modules/camp-types/entities/camp-type.entity';
import { Player } from '../../modules/players/entities/player.entity';
import { TeamAssignment } from '../../modules/team-assignments/entities/team-assignment.entity';
import { TeamTemplate } from '../../modules/team-templates/entities/team-template.entity';
import { User } from '../../modules/users/entities/user.entity';
import { CreateUsersTable1710000000000 } from './1710000000000-create-users-table';
import { CreateCampTypesTable1720000000000 } from './1720000000000-create-camp-types-table';
import { CreateTeamTemplatesTable1730000000000 } from './1730000000000-create-team-templates-table';
import { CreateCampsTable1740000000000 } from './1740000000000-create-camps-table';
import { CreateCampTeamsTable1750000000000 } from './1750000000000-create-camp-teams-table';
import { CreatePlayersTable1760000000000 } from './1760000000000-create-players-table';
import { CreateCampParticipationsTable1770000000000 } from './1770000000000-create-camp-participations-table';
import { CreateTeamAssignmentsTable1780000000000 } from './1780000000000-create-team-assignments-table';
import { CreateBattlesTable1790000000000 } from './1790000000000-create-battles-table';

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
      CampTeam,
      CampParticipation,
      Player,
      TeamAssignment,
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
