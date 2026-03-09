import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { seedSuperAdmin } from './super-admin.seed';

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
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    const result = await seedSuperAdmin(dataSource);

    if (result === 'created') {
      console.log('SUPER_ADMIN user created successfully.');
      return;
    }

    console.log('SUPER_ADMIN user already exists. Seed skipped.');
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed error';
  console.error(`Failed to run SUPER_ADMIN seed: ${message}`);
  process.exitCode = 1;
});
