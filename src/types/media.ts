import type { Role } from '@prisma/client';
export interface MediaActor { userId: string; role: Role; requestId: string }
export interface ProductUploadMetadata { altText?: string | undefined }
export interface ProofUploadMetadata { receiverName: string; receiverSignature?: string | undefined; notes?: string | undefined }
