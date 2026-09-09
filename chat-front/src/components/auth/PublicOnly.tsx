import { Box, CircularProgress } from '@mui/material'
import { Navigate, Outlet } from 'react-router-dom'
import { useGetMe } from '../../hooks/useGetMe.ts'

const PublicOnly = () => {
  const { data, loading } = useGetMe()

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (data?.me) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PublicOnly
