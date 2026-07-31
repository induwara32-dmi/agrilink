import type { Server } from 'node:http';

export function createGracefulShutdown(server: Server, disconnect: () => Promise<void>, timeoutMs: number, log: { info: (context: object, message: string) => void; error: (context: object, message: string) => void }) {
  let isShuttingDown = false;
  return async (signal: NodeJS.Signals): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    log.info({ signal }, 'Graceful shutdown started');
    const forceTimer = setTimeout(() => { log.error({ signal, timeoutMs }, 'Graceful shutdown timed out'); server.closeAllConnections(); process.exitCode = 1; }, timeoutMs);
    forceTimer.unref();
    server.close(async error => { clearTimeout(forceTimer); if (error) log.error({ error }, 'HTTP server failed to close cleanly'); await disconnect(); process.exitCode = error ? 1 : 0; });
  };
}
