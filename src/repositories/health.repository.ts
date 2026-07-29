import type { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class HealthRepository extends BaseRepository {
  public constructor(database: PrismaClient) {
    super(database);
  }

  public async isDatabaseReady(): Promise<boolean> {
    try {
      await this.database.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
