/** POST /messages/upload?chatId=… — stores file in MinIO and returns metadata. */
import { useState } from 'react'
import { getBearerToken } from '../auth/access-token.ts'
import { API_URL } from '../constants/urls.ts'
import { validateMessageAttachment } from '../utils/message-attachment.ts'

export interface UploadedAttachment {
  url: string
  fileName: string
  mimeType: string
  size: number
}

export const useUploadMessageAttachment = () => {
  const [uploading, setUploading] = useState(false)

  const upload = async (
    file: File,
    chatId: string,
  ): Promise<UploadedAttachment> => {
    const validationError = validateMessageAttachment(file)
    if (validationError) {
      throw new Error(validationError)
    }

    const body = new FormData()
    body.append('file', file)
    const token = getBearerToken()

    setUploading(true)
    try {
      const response = await fetch(
        `${API_URL}/messages/upload?chatId=${encodeURIComponent(chatId)}`,
        {
          method: 'POST',
          body,
          credentials: 'include',
          headers: token ? { authorization: token } : {},
        },
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      return (await response.json()) as UploadedAttachment
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
