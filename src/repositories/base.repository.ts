import type { PrismaClient } from '@prisma/client';

/**
 * Infrastructure base for domain repositories. Concrete repositories expose
 * intention-revealing methods rather than leaking Prisma delegates to services.
 */
export abstract class BaseRepository {
  protected constructor(protected readonly database: PrismaClient) {}
}
