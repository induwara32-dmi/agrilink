import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_CATEGORIES, seedDefaultCategories } from '../../prisma/category-seed';

describe('default category seed', () => {
  it('defines the stable active category set', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      { name: 'Vegetables', slug: 'vegetables' },
      { name: 'Fruits', slug: 'fruits' },
      { name: 'Grains', slug: 'grains' },
      { name: 'Spices', slug: 'spices' },
      { name: 'Leafy Greens', slug: 'leafy-greens' },
      { name: 'Root Crops', slug: 'root-crops' },
      { name: 'Dairy', slug: 'dairy' },
      { name: 'Other', slug: 'other' },
    ]);
  });

  it('creates missing categories as active', async () => {
    const category = { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({}) };
    const result = await seedDefaultCategories({ category } as never);
    expect(result).toEqual({ created: 8, skipped: 0 });
    expect(category.create).toHaveBeenCalledTimes(8);
    expect(category.create).toHaveBeenCalledWith({ data: { name: 'Vegetables', slug: 'vegetables', isActive: true } });
  });

  it('does not overwrite categories that already exist by name or slug', async () => {
    const category = { findFirst: vi.fn().mockResolvedValue({ id: 'existing' }), create: vi.fn() };
    const result = await seedDefaultCategories({ category } as never);
    expect(result).toEqual({ created: 0, skipped: 8 });
    expect(category.create).not.toHaveBeenCalled();
  });
});
