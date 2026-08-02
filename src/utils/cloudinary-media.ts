import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary';
import { logger } from '../config/logger';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from './api-error';

export interface UploadedImage { publicId: string; secureUrl: string; width: number; height: number; bytes: number; format: string; metadata: Record<string, string | number | boolean | null> }

export function uploadImage(buffer: Buffer, options: UploadApiOptions): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = { resource_type: 'image', overwrite: false, unique_filename: true, ...options };
    try {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          logCloudinaryUploadError(error ?? new Error('Cloudinary returned no upload result.'), uploadOptions);
          reject(mediaProviderError('MEDIA_UPLOAD_FAILED', 'Image storage rejected the upload.'));
          return;
        }
        try { resolve(toUploadedImage(result)); }
        catch { reject(mediaProviderError('MEDIA_UPLOAD_INVALID_RESPONSE', 'Image storage returned an invalid upload response.')); }
      });
      stream.on('error', (error: Error) => {
        logCloudinaryUploadError(error, uploadOptions);
        reject(mediaProviderError('MEDIA_UPLOAD_FAILED', 'The image could not be sent to image storage.'));
      });
      stream.end(buffer);
    } catch (error) {
      logCloudinaryUploadError(error, uploadOptions);
      reject(mediaProviderError('MEDIA_UPLOAD_FAILED', 'The image could not be sent to image storage.'));
    }
  });
}

function logCloudinaryUploadError(error: unknown, uploadOptions: UploadApiOptions): void {
  const providerError = toProviderError(error);
  logger.error({
    cloudinary: {
      http_code: providerError.httpCode,
      error: {
        message: providerError.message,
        name: providerError.name,
        code: providerError.code,
      },
      uploadOptions: sanitizeUploadOptions(uploadOptions),
    },
    stack: providerError.stack,
  }, 'Cloudinary image upload failed');
}

function toProviderError(error: unknown): { httpCode: number | string | undefined; message: string; name: string; code: number | string | undefined; stack: string | undefined } {
  const details = isRecord(error) ? error : {};
  return {
    httpCode: stringOrNumber(details.http_code),
    message: typeof details.message === 'string' ? details.message : String(error),
    name: typeof details.name === 'string' ? details.name : error instanceof Error ? error.name : 'UnknownProviderError',
    code: stringOrNumber(details.code),
    stack: typeof details.stack === 'string' ? details.stack : error instanceof Error ? error.stack : undefined,
  };
}

function sanitizeUploadOptions(options: UploadApiOptions): Record<string, unknown> {
  return sanitizeLogRecord(options as Record<string, unknown>);
}

function sanitizeLogRecord(value: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = /^(api[_-]?key|api[_-]?secret|secret|password|token|authorization)$/i;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sensitiveKeys.test(key) ? '[REDACTED]' : sanitizeLogValue(item)]));
}

function sanitizeLogValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeLogValue);
  return isRecord(value) ? sanitizeLogRecord(value) : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringOrNumber(value: unknown): string | number | undefined {
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
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
