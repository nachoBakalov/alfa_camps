import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserRole } from '../../modules/users/enums/user-role.enum';
import { User } from '../../modules/users/entities/user.entity';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function seedSuperAdmin(
  dataSource: DataSource,
): Promise<'created' | 'exists'> {
  const email = requireEnv('SUPER_ADMIN_EMAIL');
  const password = requireEnv('SUPER_ADMIN_PASSWORD');
  const firstName = requireEnv('SUPER_ADMIN_FIRST_NAME');
  const lastName = requireEnv('SUPER_ADMIN_LAST_NAME');

  const usersRepository = dataSource.getRepository(User);

  const existingSuperAdmin = await usersRepository.findOne({
    where: { email },
  });

  if (existingSuperAdmin) {
    return 'exists';
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = usersRepository.create({
    email,
    passwordHash,
    firstName,
    lastName,
    role: UserRole.SUPER_ADMIN,
    isActive: true,
  });

  await usersRepository.save(user);

  return 'created';
}
