import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedDefaultCategories } from './category-seed';

async function main(): Promise<void> {
  const database = new PrismaClient();

  try {
    const result = await seedDefaultCategories(database);
    process.stdout.write(`Default category seed complete: ${result.created} created, ${result.skipped} already present.\n`);
  } finally {
    await database.$disconnect();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`Default category seed failed: ${message}\n`);
  process.exitCode = 1;
});
