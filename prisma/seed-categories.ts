import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedDefaultCategories } from './category-seed';

const database = new PrismaClient();

try {
  const result = await seedDefaultCategories(database);
  process.stdout.write(`Default category seed complete: ${result.created} created, ${result.skipped} already present.\n`);
} finally {
  await database.$disconnect();
}
