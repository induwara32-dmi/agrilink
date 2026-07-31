import express from 'express';
import { createServer } from 'node:http';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { SystemController } from '../../src/controllers/system.controller';
import { createSystemRouter } from '../../src/routes/system.routes';
import { SystemService } from '../../src/services/system.service';
import type { HealthRepository } from '../../src/repositories/health.repository';
import { createGracefulShutdown } from '../../src/utils/graceful-shutdown';

describe('deployment health endpoints', () => {
  const repository = { isDatabaseReady: vi.fn().mockResolvedValue(true) };
  const app = express(); app.use('/api/v1', createSystemRouter(new SystemController(new SystemService(repository as unknown as HealthRepository))));
  it('reports health at /api/v1/health', async () => { const response = await request(app).get('/api/v1/health'); expect(response.status).toBe(200); expect(response.body.data).toMatchObject({ status: 'ok', database: 'up' }); });
  it('reports readiness at /api/v1/readiness', async () => { const response = await request(app).get('/api/v1/readiness'); expect(response.status).toBe(200); expect(response.body.data.status).toBe('ok'); });
  it('reports application version at /api/v1/version', async () => { const response = await request(app).get('/api/v1/version'); expect(response.status).toBe(200); expect(response.body.data).toMatchObject({ name: 'AgriLink API', version: '1.0.0' }); });
});

describe('graceful shutdown', () => {
  it('closes the HTTP server and database once', async () => { const server = createServer(); const close = vi.spyOn(server, 'close').mockImplementation(callback => { callback?.(); return server; }); const disconnect = vi.fn().mockResolvedValue(undefined); const log = { info: vi.fn(), error: vi.fn() }; const shutdown = createGracefulShutdown(server, disconnect, 1000, log); await shutdown('SIGTERM'); await shutdown('SIGINT'); expect(close).toHaveBeenCalledOnce(); expect(disconnect).toHaveBeenCalledOnce(); });
});
