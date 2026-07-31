import { createServer } from 'node:http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';
import { createGracefulShutdown } from './utils/graceful-shutdown';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = createServer(createApp());
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'AgriLink API listening');
  });

  const shutdown = createGracefulShutdown(server, disconnectDatabase, env.SHUTDOWN_TIMEOUT_MS, logger);

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((error: unknown) => {
  logger.fatal({ error }, 'Backend failed to start');
  process.exitCode = 1;
});
