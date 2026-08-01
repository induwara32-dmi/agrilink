import { Role } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogRepository } from '../../src/repositories/catalog.repository';
import { CatalogService } from '../../src/services/catalog.service';
import type { DomainEventPublisher } from '../../src/types/domain-events';
import { ApiError } from '../../src/utils/api-error';

describe('category service', () => {
  it('rejects duplicate category names case-insensitively', async () => {
    const repository = {
      findCategoryByName: vi.fn().mockResolvedValue({ id: 'existing-category' }),
      createCategory: vi.fn(),
    } as unknown as CatalogRepository;
    const events = { publish: vi.fn() } as unknown as DomainEventPublisher;
    const service = new CatalogService(repository, events);

    const result = service.createCategory(
      { name: 'fresh produce', isActive: true },
      { userId: 'admin-user', role: Role.ADMIN, requestId: 'request-id' },
    );

    await expect(result).rejects.toMatchObject<ApiError>({ statusCode: 409, code: 'CATEGORY_NAME_EXISTS' });
    expect(repository.findCategoryByName).toHaveBeenCalledWith('fresh produce');
    expect(repository.createCategory).not.toHaveBeenCalled();
  });
});
