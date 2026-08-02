/**
 * Idempotent initial-data seed — safe to run against a fresh Railway database
 * (or re-run without wiping existing data). Upserts the 3 base roles and one
 * staff account per role.
 *
 * Usage: pnpm run db:seed
 */
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/database/generated/prisma/client';

const SEED_PASSWORD = 'pass@6767';
const SALT_ROUNDS = 12; // matches BcryptService

async function main(): Promise<void> {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

    const accounts = [
      { code: 'SUPERADMIN' as const, roleName: 'Super Admin', email: 'superadmin@example.com', name: 'Super Admin' },
      { code: 'ADMIN' as const, roleName: 'Administrator', email: 'admin@example.com', name: 'Administrator' },
      { code: 'STAFF' as const, roleName: 'Staff', email: 'staff@example.com', name: 'Staff' },
    ];

    for (const account of accounts) {
      const role = await prisma.role.upsert({
        where: { code: account.code },
        update: {},
        create: { code: account.code, name: account.roleName },
      });

      await prisma.staffUser.upsert({
        where: { email: account.email },
        update: {},
        create: {
          email: account.email,
          name: account.name,
          passwordHash,
          roleId: role.id,
        },
      });

      console.log(`Seeded ${account.email} (${account.code})`);
    }

    console.log(`\nAll seeded accounts share password: ${SEED_PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
