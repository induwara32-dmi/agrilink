import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary';

export interface UploadedImage { publicId: string; secureUrl: string; width: number; height: number; bytes: number; format: string; metadata: Record<string, string | number | boolean | null> }

export function uploadImage(buffer: Buffer, options: UploadApiOptions): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', overwrite: false, unique_filename: true, ...options }, (error, result) => {
      if (error || !result) { reject(error ?? new Error('Cloudinary upload returned no result.')); return; }
      resolve(toUploadedImage(result));
    });
    stream.end(buffer);
  });
}

function toUploadedImage(result: UploadApiResponse): UploadedImage {
  return { publicId: result.public_id, secureUrl: result.secure_url, width: result.width, height: result.height, bytes: result.bytes, format: result.format, metadata: { assetId: result.asset_id, version: result.version, resourceType: result.resource_type } };
}

export async function deleteImage(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  if (result.result !== 'ok' && result.result !== 'not found') throw new Error(`Cloudinary deletion failed: ${result.result}`);
}
