/** POST /users/image, then refresh `me` so the avatar updates. */
import { useApolloClient } from '@apollo/client/react'
import { useState } from 'react'
import { getBearerToken } from '../auth/access-token.ts'
import { API_URL } from '../constants/urls.ts'
import { useSnackbar } from '../components/snackbar/snackbar-context.tsx'
import { validateProfileImage } from '../utils/profile-image.ts'

export const useUploadProfileImage = () => {
  const client = useApolloClient()
  const { notify } = useSnackbar()
  const [uploading, setUploading] = useState(false)

  const upload = async (file: File) => {
    const validationError = validateProfileImage(file)
    if (validationError) {
      notify({ message: validationError, severity: 'error' })
      return false
    }

    const body = new FormData()
    body.append('file', file)
    const token = getBearerToken()

    setUploading(true)
    try {
      const response = await fetch(`${API_URL}/users/image`, {
        method: 'POST',
        body,
        credentials: 'include',
        headers: token ? { authorization: token } : {},
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      await client.refetchQueries({ include: ['Me'] })
      notify({ message: 'Photo updated.', severity: 'success' })
      return true
    } catch {
      notify({
        message: 'Could not upload that photo. Try a smaller JPEG.',
        severity: 'error',
      })
      return false
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
