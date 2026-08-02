import { DeliveryMethod, DeliveryStatus, Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { MediaRepository } from '../../src/repositories/media.repository';
import { MediaService } from '../../src/services/media.service';
import { productImagesUpload } from '../../src/middlewares/upload.middleware';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { cloudinary } from '../../src/config/cloudinary';

const { uploadImage, deleteImage } = vi.hoisted(() => ({ uploadImage: vi.fn(), deleteImage: vi.fn() }));
vi.mock('../../src/utils/cloudinary-media', () => ({ uploadImage, deleteImage }));
const actor = { userId: '11111111-1111-4111-8111-111111111111', role: Role.FARMER, requestId: 'request-1' };
const jpeg = { buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]), originalname: 'proof.jpg', mimetype: 'image/jpeg' } as Express.Multer.File;

describe('media authorization and deletion', () => {
  beforeEach(() => { vi.clearAllMocks(); uploadImage.mockResolvedValue({ publicId: 'asset-1', secureUrl: 'https://example.test/image.jpg', width: 100, height: 100, bytes: 4, format: 'jpg', metadata: {} }); deleteImage.mockResolvedValue(undefined); });
  it('rejects spoofed image content before upload', async () => { const repository = { findProfile: vi.fn() }; const service = new MediaService(repository as unknown as MediaRepository); await expect(service.uploadProfileImage({ ...jpeg, buffer: Buffer.from('not-image') }, actor)).rejects.toMatchObject({ code: 'INVALID_IMAGE_CONTENT' }); expect(uploadImage).not.toHaveBeenCalled(); });
  it('rejects product uploads by non-owners', async () => { const repository = { findProduct: vi.fn().mockResolvedValue({ farmer: { userId: 'someone-else' }, images: [] }) }; const service = new MediaService(repository as unknown as MediaRepository); await expect(service.uploadProductImages('product-1', [jpeg], {}, actor)).rejects.toMatchObject({ code: 'PRODUCT_FORBIDDEN' }); });
  it('enforces the eight-image product limit before provider upload', async () => { const repository = { findProduct: vi.fn().mockResolvedValue({ farmer: { userId: actor.userId }, images: Array.from({ length: 8 }, (_, index) => ({ id: `image-${index}` })) }) }; const service = new MediaService(repository as unknown as MediaRepository); await expect(service.uploadProductImages('product-1', [jpeg], {}, actor)).rejects.toMatchObject({ code: 'PRODUCT_IMAGE_LIMIT' }); expect(uploadImage).not.toHaveBeenCalled(); });
  it('uploads and persists product image metadata', async () => { const stored = { id: 'image-1', productId: 'product-1', storageKey: 'asset-1', url: 'https://example.test/image.jpg', width: 100, height: 100, bytes: 4, format: 'jpg', sortOrder: 0, isPrimary: true }; const repository = { findProduct: vi.fn().mockResolvedValue({ farmer: { userId: actor.userId }, images: [] }), addProductImages: vi.fn().mockResolvedValue([stored]) }; const service = new MediaService(repository as unknown as MediaRepository); await expect(service.uploadProductImages('product-1', [jpeg], { altText: 'Fresh produce' }, actor)).resolves.toEqual([stored]); expect(repository.addProductImages).toHaveBeenCalledWith('product-1', [expect.objectContaining({ publicId: 'asset-1', secureUrl: 'https://example.test/image.jpg', width: 100, height: 100, format: 'jpg' })], 'Fresh produce', actor.userId, actor.requestId); });
  it('cleans up uploaded product assets when persistence fails', async () => { const repository = { findProduct: vi.fn().mockResolvedValue({ farmer: { userId: actor.userId }, images: [] }), addProductImages: vi.fn().mockRejectedValue(new Error('database failure')) }; const service = new MediaService(repository as unknown as MediaRepository); await expect(service.uploadProductImages('product-1', [jpeg], {}, actor)).rejects.toThrow('database failure'); expect(deleteImage).toHaveBeenCalledWith('asset-1'); });
  it('deletes the Cloudinary image before removing its reference', async () => { const repository = { findProduct: vi.fn().mockResolvedValue({ farmer: { userId: actor.userId }, images: [] }), findImage: vi.fn().mockResolvedValue({ id: 'image-1', productId: 'product-1', storageKey: 'asset-1' }), deleteProductImage: vi.fn().mockResolvedValue({}) }; const service = new MediaService(repository as unknown as MediaRepository); await service.deleteProductImage('product-1', 'image-1', actor); expect(deleteImage).toHaveBeenCalledWith('asset-1'); expect(repository.deleteProductImage).toHaveBeenCalledOnce(); });
  it('rejects proof uploads from an unassigned transporter', async () => { const repository = { findDelivery: vi.fn().mockResolvedValue({ method: DeliveryMethod.PLATFORM_TRANSPORTER, status: DeliveryStatus.IN_TRANSIT, transportJob: { acceptedById: 'different-user' }, farmerOrder: { farmer: { userId: 'farmer' } } }) }; const service = new MediaService(repository as unknown as MediaRepository); await expect(service.uploadDeliveryProof('delivery-1', jpeg, { receiverName: 'Receiver' }, { ...actor, role: Role.TRANSPORTER })).rejects.toMatchObject({ code: 'PROOF_UPLOAD_FORBIDDEN' }); });
  it('cleans up a new proof image when persistence fails', async () => { const repository = { findDelivery: vi.fn().mockResolvedValue({ method: DeliveryMethod.FARMER_DELIVERY, status: DeliveryStatus.IN_TRANSIT, proofStorageKey: null, transportJob: null, farmerOrder: { farmer: { userId: actor.userId } } }), updateProof: vi.fn().mockRejectedValue(new Error('database failure')) }; const service = new MediaService(repository as unknown as MediaRepository); await expect(service.uploadDeliveryProof('delivery-1', jpeg, { receiverName: 'Receiver' }, actor)).rejects.toThrow('database failure'); expect(deleteImage).toHaveBeenCalledWith('asset-1'); });
});

describe('Cloudinary configuration', () => {
  it('initializes all required signed-upload credentials from the environment', () => { const configuration = cloudinary.config(); expect(Boolean(configuration.cloud_name)).toBe(true); expect(Boolean(configuration.api_key)).toBe(true); expect(Boolean(configuration.api_secret)).toBe(true); expect(configuration.secure).toBe(true); });
});

describe('product upload middleware', () => {
  function uploadApp() { const app = express(); app.post('/upload', productImagesUpload, (_request, response) => response.status(201).json({ success: true })); app.use(errorMiddleware); return app; }
  it('rejects unsupported product image MIME types', async () => { const response = await request(uploadApp()).post('/upload').attach('images', Buffer.from('plain text'), { filename: 'image.txt', contentType: 'text/plain' }); expect(response.status).toBe(422); expect(response.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE'); });
  it('rejects product images larger than five MiB', async () => { const response = await request(uploadApp()).post('/upload').attach('images', Buffer.alloc(5 * 1024 * 1024 + 1, 1), { filename: 'large.jpg', contentType: 'image/jpeg' }); expect(response.status).toBe(413); expect(response.body.error.code).toBe('UPLOAD_VALIDATION_ERROR'); });
});
