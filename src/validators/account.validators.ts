import { z } from 'zod';

const empty = z.object({}).strict();
const uuid = z.string().uuid();
const request = <B extends z.ZodType, P extends z.ZodType, Q extends z.ZodType>(body: B, params: P, query: Q) => z.object({ body, params, query });
const addressParams = z.object({ addressId: uuid });
const latitude = z.string().regex(/^-?\d+(\.\d{1,7})?$/).refine(value => Number(value) >= -90 && Number(value) <= 90, 'Latitude must be between -90 and 90.');
const longitude = z.string().regex(/^-?\d+(\.\d{1,7})?$/).refine(value => Number(value) >= -180 && Number(value) <= 180, 'Longitude must be between -180 and 180.');

const addressBody = z.object({
  label: z.string().trim().max(80).optional(),
  recipientName: z.string().trim().min(1).max(180),
  recipientPhone: z.string().trim().min(7).max(32),
  line1: z.string().trim().min(1).max(255),
  line2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(1).max(120),
  district: z.string().trim().max(120).optional(),
  region: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().max(32).optional(),
  countryCode: z.string().trim().length(2).transform(value => value.toUpperCase()),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
  isDefault: z.boolean().optional(),
});

export const listAddressesSchema = request(empty, empty, empty);
export const createAddressSchema = request(addressBody, empty, empty);
export const updateAddressSchema = request(
  addressBody.partial().refine(value => Object.keys(value).length > 0, 'Provide at least one field to update.'),
  addressParams,
  empty,
);

const profileBody = z
  .object({
    phone: z.string().trim().min(7).max(32).optional(),
    whatsappNumber: z.string().trim().min(7).max(32).optional(),
  })
  .refine(value => Object.keys(value).length > 0, 'Provide at least one field to update.');
export const updateProfileSchema = request(profileBody, empty, empty);

export type CreateAddressBody = z.infer<typeof createAddressSchema>['body'];
export type UpdateAddressBody = z.infer<typeof updateAddressSchema>['body'];
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>['body'];
