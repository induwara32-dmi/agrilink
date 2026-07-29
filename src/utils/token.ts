import { createHash, randomBytes, randomUUID } from 'node:crypto';

export function createOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createTokenId(): string {
  return randomUUID();
}

export function durationFromNow(duration: string): Date {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration);
  if (!match) throw new Error(`Unsupported duration: ${duration}`);

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = unit === 's' ? 1_000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return new Date(Date.now() + amount * multiplier);
}
