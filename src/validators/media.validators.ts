import { z } from 'zod';
const uuid = z.string().uuid();
const empty = z.object({});
const request = <B extends z.ZodType, P extends z.ZodType, Q extends z.ZodType>(body: B, params: P, query: Q) => z.object({ body, params, query });
const productParams = z.object({ id: uuid });
const imageParams = z.object({ id: uuid, imageId: uuid });
const deliveryParams = z.object({ deliveryId: uuid });

export const productUploadSchema = request(z.object({ altText: z.string().trim().max(255).optional() }), productParams, empty);
export const productImageSchema = request(empty, imageParams, empty);
export const reorderImagesSchema = request(z.object({ imageIds: z.array(uuid).min(1).max(8).refine(ids => new Set(ids).size === ids.length, 'Image IDs must be unique.') }), productParams, empty);
export const profileUploadSchema = request(empty, empty, empty);
export const proofUploadSchema = request(z.object({ receiverName: z.string().trim().min(2).max(180), receiverSignature: z.string().trim().max(20_000).optional(), notes: z.string().trim().max(2000).optional() }), deliveryParams, empty);

export type ProductUploadBody = z.infer<typeof productUploadSchema>['body'];
export type ReorderImagesBody = z.infer<typeof reorderImagesSchema>['body'];
export type ProofUploadBody = z.infer<typeof proofUploadSchema>['body'];
