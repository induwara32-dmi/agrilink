import type { Role } from '@prisma/client';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Exclude<Role, 'ADMIN'>;
  farmName?: string;
  businessName?: string;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}
