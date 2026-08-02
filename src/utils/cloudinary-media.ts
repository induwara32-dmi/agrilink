import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from './api-error';

export interface UploadedImage { publicId: string; secureUrl: string; width: number; height: number; bytes: number; format: string; metadata: Record<string, string | number | boolean | null> }

export function uploadImage(buffer: Buffer, options: UploadApiOptions): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', overwrite: false, unique_filename: true, ...options }, (error, result) => {
        if (error || !result) { reject(mediaProviderError('MEDIA_UPLOAD_FAILED', 'Image storage rejected the upload.')); return; }
        try { resolve(toUploadedImage(result)); }
        catch { reject(mediaProviderError('MEDIA_UPLOAD_INVALID_RESPONSE', 'Image storage returned an invalid upload response.')); }
      });
      stream.on('error', () => reject(mediaProviderError('MEDIA_UPLOAD_FAILED', 'The image could not be sent to image storage.')));
      stream.end(buffer);
    } catch {
      reject(mediaProviderError('MEDIA_UPLOAD_FAILED', 'The image could not be sent to image storage.'));
    }
  });
}

function toUploadedImage(result: UploadApiResponse): UploadedImage {
  if (!result.public_id || !result.secure_url || !result.width || !result.height || !result.format) throw new Error('Incomplete Cloudinary image response.');
  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
    metadata: {
      ...(result.asset_id ? { assetId: result.asset_id } : {}),
      ...(result.version !== undefined ? { version: result.version } : {}),
      ...(result.resource_type ? { resourceType: result.resource_type } : {}),
    },
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    if (result.result !== 'ok' && result.result !== 'not found') throw new Error('Image was not deleted.');
  } catch {
    throw mediaProviderError('MEDIA_DELETE_FAILED', 'The image could not be removed from image storage.');
  }
}

function mediaProviderError(code: string, message: string): ApiError {
  return new ApiError(HTTP_STATUS.BAD_GATEWAY, code, message);
}
