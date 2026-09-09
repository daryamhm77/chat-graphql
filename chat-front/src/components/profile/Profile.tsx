/** Signed-in user's name, avatar, and JPEG photo upload. */
import UploadFile from '@mui/icons-material/UploadFile'
import { Avatar, Button, Container, Stack, Typography } from '@mui/material'
import { useState, type ChangeEvent } from 'react'
import { useGetMe } from '../../hooks/useGetMe.ts'
import { useUploadProfileImage } from '../../hooks/useUploadProfileImage.ts'
import {
  PROFILE_IMAGE_ACCEPT,
  PROFILE_IMAGE_MAX_BYTES,
} from '../../utils/profile-image.ts'

const withCacheBust = (url: string, version: number) => {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${version}`
}

const Profile = () => {
  const { data } = useGetMe()
  const { upload, uploading } = useUploadProfileImage()
  const [imageVersion, setImageVersion] = useState(0)
  const user = data?.me

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    const uploaded = await upload(file)
    if (uploaded) {
      setImageVersion(Date.now())
    }
  }

  const avatarSrc = user?.imageUrl
    ? withCacheBust(user.imageUrl, imageVersion)
    : undefined

  return (
    <Container maxWidth="sm">
    <Stack
      spacing={3}
      sx={{
        py: 6,
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Avatar
        src={avatarSrc}
        alt={user?.username ?? 'Profile photo'}
        sx={{ width: 160, height: 160 }}
      />
      <Stack spacing={0.5}>
        <Typography variant="h4" component="h1">
          {user?.username}
        </Typography>
        <Typography color="text.secondary">{user?.email}</Typography>
      </Stack>
      <Button
        component="label"
        variant="contained"
        startIcon={<UploadFile />}
        disabled={uploading}
      >
        {uploading ? 'Uploading…' : 'Upload photo'}
        <input
          type="file"
          hidden
          accept={PROFILE_IMAGE_ACCEPT}
          onChange={(event) => {
            void handleFileChange(event)
          }}
        />
      </Button>
      <Typography variant="caption" color="text.secondary">
        JPEG only, up to {Math.floor(PROFILE_IMAGE_MAX_BYTES / 1000)} KB.
      </Typography>
    </Stack>
    </Container>
  )
}

export default Profile
