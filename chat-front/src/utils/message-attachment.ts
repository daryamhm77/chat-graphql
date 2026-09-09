/** Allowed images and documents for chat attachments (Max 10 MB). */
const MAX_BYTES = 10 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/csv',
])

export const validateMessageAttachment = (file: File): string | null => {
  if (file.size > MAX_BYTES) {
    return 'File must be 10 MB or smaller.'
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'Unsupported file type. Use images, PDF, Office docs, ZIP, TXT, or CSV.'
  }
  return null
}

export const isImageMimeType = (mimeType?: string | null) =>
  Boolean(mimeType?.startsWith('image/'))
