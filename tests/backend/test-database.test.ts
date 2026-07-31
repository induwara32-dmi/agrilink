import { afterEach, describe, expect, it } from 'vitest';
import { testDatabase } from '../utils/database';

describe('Prisma test database safety', () => {
  const original = process.env.TEST_DATABASE_URL;
  afterEach(() => { if (original === undefined) delete process.env.TEST_DATABASE_URL; else process.env.TEST_DATABASE_URL = original; });
  it('refuses a database URL without a test marker', () => { process.env.TEST_DATABASE_URL = 'postgresql://user:password@db.example.com/production'; expect(() => testDatabase()).toThrow('dedicated test database'); });
});
