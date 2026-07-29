import { createServer } from 'node:http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = createServer(createApp());
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'AgriLink API listening');
  });

  let isShuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info({ signal }, 'Graceful shutdown started');

    server.close(async (error) => {
      if (error) logger.error({ error }, 'HTTP server failed to close cleanly');
      await disconnectDatabase();
      process.exitCode = error ? 1 : 0;
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((error: unknown) => {
  logger.fatal({ error }, 'Backend failed to start');
  process.exitCode = 1;
});
