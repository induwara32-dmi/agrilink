import { afterEach, describe, expect, it, vi } from 'vitest';

const originalCloudinaryUrl = process.env.CLOUDINARY_URL;

describe('Cloudinary configuration', () => {
  afterEach(() => {
    if (originalCloudinaryUrl === undefined) delete process.env.CLOUDINARY_URL;
    else process.env.CLOUDINARY_URL = originalCloudinaryUrl;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('ignores CLOUDINARY_URL credentials and signing settings when explicit credentials are configured', async () => {
    process.env.CLOUDINARY_URL = 'cloudinary://stale-key:stale-secret@stale-cloud?signature_algorithm=sha256&signature_version=1';
    const loggerInfo = vi.fn();
    vi.doMock('../../src/config/logger', () => ({ logger: { info: loggerInfo } }));

    const { cloudinary } = await import('../../src/config/cloudinary');
    const configuration = cloudinary.config();

    expect(configuration).toMatchObject({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    expect(configuration).not.toHaveProperty('signature_algorithm');
    expect(configuration).not.toHaveProperty('signature_version');
    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({
      cloudinary: expect.objectContaining({
        authenticationMethod: 'explicit_environment_credentials',
        cloudinaryUrlPresent: true,
        cloudinaryUrlIgnored: true,
      }),
    }), 'Cloudinary SDK configured');
  });
});
