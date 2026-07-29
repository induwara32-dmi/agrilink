import { API_VERSION, APPLICATION_NAME } from '../constants/application';
import type { HealthRepository } from '../repositories/health.repository';
import { BaseService } from './base.service';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  timestamp: string;
}

export class SystemService extends BaseService {
  public constructor(private readonly healthRepository: HealthRepository) {
    super();
  }

  public async getHealth(): Promise<HealthStatus> {
    const databaseReady = await this.healthRepository.isDatabaseReady();

    return {
      status: databaseReady ? 'ok' : 'degraded',
      database: databaseReady ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }

  public getVersion(): { name: string; version: string } {
    return { name: APPLICATION_NAME, version: API_VERSION };
  }
}
