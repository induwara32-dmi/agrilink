import { PrismaClient } from '@prisma/client';

export function testDatabase(): PrismaClient {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !/(test|localhost)/i.test(url)) throw new Error('TEST_DATABASE_URL must identify a dedicated test database.');
  return new PrismaClient({ datasourceUrl: url });
}

export async function resetTestDatabase(database: PrismaClient): Promise<void> {
  const url = process.env.TEST_DATABASE_URL ?? '';
  if (!/(test|localhost)/i.test(url)) throw new Error('Refusing to reset a database without a test marker.');
  const tables = await database.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length) await database.$executeRawUnsafe(`TRUNCATE TABLE ${tables.map(table => `"${table.tablename.replaceAll('"', '""')}"`).join(', ')} RESTART IDENTITY CASCADE`);
}
