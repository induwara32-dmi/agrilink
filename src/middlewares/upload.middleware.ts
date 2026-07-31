import multer from 'multer';
import { MEDIA_LIMITS, SUPPORTED_IMAGE_TYPES } from '../constants/media';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from '../utils/api-error';

const storage = multer.memoryStorage();
const imageFilter: NonNullable<multer.Options['fileFilter']> = (_request, file, callback) => {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.mimetype as (typeof SUPPORTED_IMAGE_TYPES)[number])) {
    callback(new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'UNSUPPORTED_MEDIA_TYPE', 'Only JPEG, PNG, and WebP images are supported.'));
    return;
  }
  callback(null, true);
};

function uploader(maxBytes: number) { return multer({ storage, fileFilter: imageFilter, limits: { fileSize: maxBytes } }); }

export const productImagesUpload = uploader(MEDIA_LIMITS.product.maxBytes).array('images', MEDIA_LIMITS.product.maxFilesPerRequest);
export const profileImageUpload = uploader(MEDIA_LIMITS.profile.maxBytes).single('image');
export const deliveryProofUpload = uploader(MEDIA_LIMITS.proof.maxBytes).single('image');
