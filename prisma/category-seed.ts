import { Prisma, type PrismaClient } from '@prisma/client';

export const DEFAULT_CATEGORIES = [
  { name: 'Vegetables', slug: 'vegetables' },
  { name: 'Fruits', slug: 'fruits' },
  { name: 'Grains', slug: 'grains' },
  { name: 'Spices', slug: 'spices' },
  { name: 'Leafy Greens', slug: 'leafy-greens' },
  { name: 'Root Crops', slug: 'root-crops' },
  { name: 'Dairy', slug: 'dairy' },
  { name: 'Other', slug: 'other' },
] as const;

type CategorySeedDatabase = Pick<PrismaClient, 'category'>;

export interface CategorySeedResult {
  created: number;
  skipped: number;
}

/** Inserts missing reference categories without changing any existing record. */
export async function seedDefaultCategories(database: CategorySeedDatabase): Promise<CategorySeedResult> {
  let created = 0;
  let skipped = 0;

  for (const category of DEFAULT_CATEGORIES) {
    const existing = await database.category.findFirst({
      where: {
        OR: [
          { slug: category.slug },
          { name: { equals: category.name, mode: 'insensitive' } },
        ],
      },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    try {
      await database.category.create({ data: { ...category, isActive: true } });
      created += 1;
    } catch (error) {
      // A concurrent seed/admin request may win after the lookup. A uniqueness
      // conflict means the desired reference record now exists and is safe.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        skipped += 1;
        continue;
      }
      throw error;
    }
  }

  return { created, skipped };
}
