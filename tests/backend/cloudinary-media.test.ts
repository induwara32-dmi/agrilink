import { beforeEach, describe, expect, it, vi } from 'vitest';

const { uploadStream, destroy } = vi.hoisted(() => ({ uploadStream: vi.fn(), destroy: vi.fn() }));
vi.mock('../../src/config/cloudinary', () => ({ cloudinary: { uploader: { upload_stream: uploadStream, destroy } } }));

import { deleteImage, uploadImage } from '../../src/utils/cloudinary-media';

function writableStream() { return { on: vi.fn(), end: vi.fn() }; }

describe('Cloudinary media adapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps provider upload rejection to an operational response', async () => {
    uploadStream.mockImplementation((_options, callback) => { callback(new Error('provider rejected request'), undefined); return writableStream(); });
    await expect(uploadImage(Buffer.from('image'), { folder: 'test' })).rejects.toMatchObject({ statusCode: 502, code: 'MEDIA_UPLOAD_FAILED', isOperational: true });
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
