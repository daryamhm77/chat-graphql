/** Matches the backend users/image endpoint: JPEG only, 100 KB max. */
export const PROFILE_IMAGE_MAX_BYTES = 100_000
export const PROFILE_IMAGE_ACCEPT = 'image/jpeg,.jpg,.jpeg'

export const validateProfileImage = (file: File) => {
  const isJpeg =
    file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)
  if (!isJpeg) {
    return 'Please choose a JPEG image.'
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return 'Image must be 100 KB or smaller.'
  }
}
