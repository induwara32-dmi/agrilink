import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const passwordUtility = {
  hash(value: string): Promise<string> {
    return bcrypt.hash(value, env.BCRYPT_SALT_ROUNDS);
  },

  verify(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  },
};
