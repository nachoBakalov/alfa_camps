import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CampTeam } from '../../modules/camp-teams/entities/camp-team.entity';
import { Camp } from '../../modules/camps/entities/camp.entity';
import { CampType } from '../../modules/camp-types/entities/camp-type.entity';
import { TeamTemplate } from '../../modules/team-templates/entities/team-template.entity';
import { User } from '../../modules/users/entities/user.entity';
import { CreateUsersTable1710000000000 } from './1710000000000-create-users-table';
import { CreateCampTypesTable1720000000000 } from './1720000000000-create-camp-types-table';
import { CreateTeamTemplatesTable1730000000000 } from './1730000000000-create-team-templates-table';
import { CreateCampsTable1740000000000 } from './1740000000000-create-camps-table';
import { CreateCampTeamsTable1750000000000 } from './1750000000000-create-camp-teams-table';

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
    entities: [User, CampType, TeamTemplate, Camp, CampTeam],
    migrations: [
      CreateUsersTable1710000000000,
      CreateCampTypesTable1720000000000,
      CreateTeamTemplatesTable1730000000000,
      CreateCampsTable1740000000000,
      CreateCampTeamsTable1750000000000,
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
