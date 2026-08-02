/**
 * One-off dev DB reset + reseed. Run manually — NOT part of any automatic migration.
 * Usage: pnpm exec ts-node -r tsconfig-paths/register scripts/reset-and-seed.ts
 *
 * Truncates every table, then (only after prisma/schema.prisma's RoleCode enum
 * migration has been applied) recreates 3 Role rows and 3 StaffUser accounts,
 * one per role, all with the same seed password.
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
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "table_session", "session_member", "cart", "cart_item",
        "order_round", "order_item", "bill_discount", "bill_share",
        "payment", "bill", "customer", "dinning_table", "menu_item",
        "menu_category", "store_setting", "staff_user", "role"
      RESTART IDENTITY CASCADE;
    `);
    console.log('Truncated all tables.');

    const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

    const roles = await Promise.all([
      prisma.role.create({ data: { code: 'SUPERADMIN', name: 'Super Admin' } }),
      prisma.role.create({ data: { code: 'ADMIN', name: 'Administrator' } }),
      prisma.role.create({ data: { code: 'STAFF', name: 'Staff' } }),
    ]);

    const accounts = [
      { email: 'superadmin@example.com', name: 'Super Admin', role: roles[0] },
      { email: 'admin@example.com', name: 'Administrator', role: roles[1] },
      { email: 'staff@example.com', name: 'Staff', role: roles[2] },
    ];

    for (const account of accounts) {
      await prisma.staffUser.create({
        data: {
          email: account.email,
          name: account.name,
          passwordHash,
          roleId: account.role.id,
        },
      });
      console.log(`Created ${account.email} (${account.role.code})`);
    }

    console.log(`\nAll 3 accounts share password: ${SEED_PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
