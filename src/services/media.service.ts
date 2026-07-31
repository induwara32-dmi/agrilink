import { DeliveryMethod, DeliveryStatus, Role } from '@prisma/client';
import { HTTP_STATUS } from '../constants/application';
import { MEDIA_LIMITS } from '../constants/media';
import type { MediaRepository } from '../repositories/media.repository';
import type { MediaActor, ProductUploadMetadata, ProofUploadMetadata } from '../types/media';
import { ApiError } from '../utils/api-error';
import { deleteImage, uploadImage, type UploadedImage } from '../utils/cloudinary-media';
import { BaseService } from './base.service';

const proofStates = new Set<DeliveryStatus>([DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED]);
function assertImageContent(file: Express.Multer.File): void {
  const bytes = file.buffer;
  const jpeg = bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.length > 7 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = bytes.length > 11 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  if (!jpeg && !png && !webp) throw new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'INVALID_IMAGE_CONTENT', 'The uploaded file content is not a supported image.');
}

export class MediaService extends BaseService {
  public constructor(private readonly repository: MediaRepository) { super(); }

  public async uploadProductImages(productId: string, files: Express.Multer.File[], input: ProductUploadMetadata, actor: MediaActor) {
    const product = await this.requireProductOwner(productId, actor);
    if (!files.length) throw new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'IMAGE_REQUIRED', 'Select at least one image.');
    files.forEach(assertImageContent);
    if (product.images.length + files.length > MEDIA_LIMITS.product.maxFilesPerProduct) throw new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'PRODUCT_IMAGE_LIMIT', `A product may contain at most ${MEDIA_LIMITS.product.maxFilesPerProduct} images.`);
    const uploaded: UploadedImage[] = [];
    try {
      for (const file of files) uploaded.push(await uploadImage(file.buffer, { folder: `agrilink/products/${productId}`, context: { uploadedBy: actor.userId, originalName: file.originalname } }));
      return await this.repository.addProductImages(productId, uploaded, input.altText, actor.userId, actor.requestId);
    } catch (error) {
      await Promise.allSettled(uploaded.map(image => deleteImage(image.publicId)));
      throw error;
    }
  }

  public async reorderProductImages(productId: string, imageIds: string[], actor: MediaActor) { await this.requireProductOwner(productId, actor); try { return await this.repository.reorderProductImages(productId, imageIds, actor.userId, actor.requestId); } catch (error) { if (error instanceof Error && error.message === 'IMAGE_SET_MISMATCH') throw new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'IMAGE_SET_MISMATCH', 'The ordered image list must include every product image exactly once.'); throw error; } }
  public async setPrimaryImage(productId: string, imageId: string, actor: MediaActor) { await this.requireProductOwner(productId, actor); await this.requireProductImage(productId, imageId); return this.repository.setPrimaryImage(productId, imageId, actor.userId, actor.requestId); }
  public async deleteProductImage(productId: string, imageId: string, actor: MediaActor) { await this.requireProductOwner(productId, actor); const image = await this.requireProductImage(productId, imageId); await deleteImage(image.storageKey); return this.repository.deleteProductImage(productId, imageId, actor.userId, actor.requestId); }

  public async uploadProfileImage(file: Express.Multer.File | undefined, actor: MediaActor) {
    if (!file) throw new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'IMAGE_REQUIRED', 'Select a profile image.');
    assertImageContent(file);
    const existing = await this.repository.findProfile(actor.userId);
    if (!existing) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'PROFILE_NOT_FOUND', 'Profile not found.');
    const uploaded = await uploadImage(file.buffer, { folder: `agrilink/profiles/${actor.userId}`, transformation: [{ width: 800, height: 800, crop: 'limit' }], context: { uploadedBy: actor.userId, originalName: file.originalname } });
    try { const profile = await this.repository.updateAvatar(actor.userId, uploaded, actor.requestId); if (existing.avatarPublicId) await deleteImage(existing.avatarPublicId); return profile; } catch (error) { await deleteImage(uploaded.publicId).catch(() => undefined); throw error; }
  }
  public async deleteProfileImage(actor: MediaActor) { const existing = await this.repository.findProfile(actor.userId); if (!existing) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'PROFILE_NOT_FOUND', 'Profile not found.'); if (!existing.avatarPublicId) return existing; await deleteImage(existing.avatarPublicId); return this.repository.deleteAvatar(actor.userId, actor.requestId); }

  public async uploadDeliveryProof(deliveryId: string, file: Express.Multer.File | undefined, input: ProofUploadMetadata, actor: MediaActor) {
    if (!file) throw new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'IMAGE_REQUIRED', 'A proof-of-delivery image is required.');
    assertImageContent(file);
    const delivery = await this.repository.findDelivery(deliveryId);
    if (!delivery) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'DELIVERY_NOT_FOUND', 'Delivery not found.');
    const authorized = delivery.method === DeliveryMethod.PLATFORM_TRANSPORTER ? actor.role === Role.TRANSPORTER && delivery.transportJob?.acceptedById === actor.userId : delivery.method === DeliveryMethod.FARMER_DELIVERY && actor.role === Role.FARMER && delivery.farmerOrder.farmer.userId === actor.userId;
    if (!authorized) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'PROOF_UPLOAD_FORBIDDEN', 'Only the assigned transporter or farmer-delivery owner may upload proof.');
    if (!proofStates.has(delivery.status)) throw new ApiError(HTTP_STATUS.CONFLICT, 'INVALID_DELIVERY_STATE', 'Proof may be uploaded only after pickup and before or at delivery completion.');
    const uploaded = await uploadImage(file.buffer, { folder: `agrilink/delivery-proofs/${deliveryId}`, context: { uploadedBy: actor.userId, deliveryId, originalName: file.originalname } });
    try { const proofInput = { receiverName: input.receiverName, ...(input.receiverSignature ? { receiverSignature: input.receiverSignature } : {}), ...(input.notes ? { notes: input.notes } : {}) }; const updated = await this.repository.updateProof(deliveryId, uploaded, proofInput, actor.userId, actor.requestId); if (delivery.proofStorageKey) await deleteImage(delivery.proofStorageKey); return updated; } catch (error) { await deleteImage(uploaded.publicId).catch(() => undefined); throw error; }
  }

  private async requireProductOwner(productId: string, actor: MediaActor) { const product = await this.repository.findProduct(productId); if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'PRODUCT_NOT_FOUND', 'Product not found.'); if (actor.role !== Role.ADMIN && product.farmer.userId !== actor.userId) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'PRODUCT_FORBIDDEN', 'You cannot manage this product.'); return product; }
  private async requireProductImage(productId: string, imageId: string) { const image = await this.repository.findImage(imageId); if (!image || image.productId !== productId) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'IMAGE_NOT_FOUND', 'Product image not found.'); return image; }
}
