import { beforeEach, describe, expect, it, vi } from 'vitest';

const { uploadStream, destroy, loggerError } = vi.hoisted(() => ({ uploadStream: vi.fn(), destroy: vi.fn(), loggerError: vi.fn() }));
vi.mock('../../src/config/cloudinary', () => ({ cloudinary: { uploader: { upload_stream: uploadStream, destroy } } }));
vi.mock('../../src/config/logger', () => ({ logger: { error: loggerError } }));

import { deleteImage, uploadImage } from '../../src/utils/cloudinary-media';

function writableStream() { return { on: vi.fn(), end: vi.fn() }; }

describe('Cloudinary media adapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps provider upload rejection to an operational response', async () => {
    const providerError = { message: 'provider rejected request', name: 'CloudinaryError', http_code: 401, code: 'InvalidSignature', stack: 'cloudinary provider stack' };
    uploadStream.mockImplementation((_options, callback) => { callback(providerError, undefined); return writableStream(); });
    await expect(uploadImage(Buffer.from('image'), { folder: 'test' })).rejects.toMatchObject({ statusCode: 502, code: 'MEDIA_UPLOAD_FAILED', isOperational: true });
    expect(loggerError).toHaveBeenCalledWith(expect.objectContaining({
      cloudinary: {
        http_code: 401,
        error: { message: 'provider rejected request', name: 'CloudinaryError', code: 'InvalidSignature' },
        uploadOptions: { resource_type: 'image', overwrite: false, unique_filename: true, folder: 'test' },
      },
      stack: 'cloudinary provider stack',
    }), 'Cloudinary image upload failed');
  });

  it('removes authentication fields accidentally included in upload options', async () => {
    uploadStream.mockImplementation((_options, callback) => { callback(new Error('provider rejected request'), undefined); return writableStream(); });
    await expect(uploadImage(Buffer.from('image'), { folder: 'test', api_key: 'must-not-log' } as never)).rejects.toMatchObject({ code: 'MEDIA_UPLOAD_FAILED' });
    expect(uploadStream).toHaveBeenCalledWith(expect.not.objectContaining({ api_key: expect.anything() }), expect.any(Function));
    expect(loggerError).toHaveBeenCalledWith(expect.objectContaining({ cloudinary: expect.objectContaining({ uploadOptions: expect.not.objectContaining({ api_key: expect.anything() }) }) }), 'Cloudinary image upload failed');
  });

  it('omits absent optional provider metadata', async () => {
    uploadStream.mockImplementation((_options, callback) => { callback(undefined, { public_id: 'asset-1', secure_url: 'https://example.test/image.webp', width: 20, height: 10, bytes: 100, format: 'webp' }); return writableStream(); });
    await expect(uploadImage(Buffer.from('image'), { folder: 'test' })).resolves.toMatchObject({ publicId: 'asset-1', secureUrl: 'https://example.test/image.webp', metadata: {} });
  });

  it('maps provider deletion rejection to an operational response', async () => {
    destroy.mockRejectedValue(new Error('provider unavailable'));
    await expect(deleteImage('asset-1')).rejects.toMatchObject({ statusCode: 502, code: 'MEDIA_DELETE_FAILED', isOperational: true });
  });
});
