/** Logo + app name. One component covers mobile and desktop. */
import { Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

interface BrandingProps {
  variant: 'mobile' | 'desktop'
}

const Branding = ({ variant }: BrandingProps) => {
  const isMobile = variant === 'mobile'

  return (
    <Box
      component={Link}
        to="/direct"
      aria-label="Chat home"
      sx={{
        display: {
          xs: isMobile ? 'flex' : 'none',
          md: isMobile ? 'none' : 'flex',
        },
        alignItems: 'center',
        mr: 2,
        flexGrow: isMobile ? 1 : 0,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <Box
        component="img"
        src="/chat-icon.png"
        alt=""
        aria-hidden
        sx={{
          width: isMobile ? 32 : 28,
          height: isMobile ? 32 : 28,
          mr: 1,
          borderRadius: 0.75,
          display: 'block',
        }}
      />
      <Typography
        variant={isMobile ? 'h5' : 'h6'}
        noWrap
        sx={{
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.2rem',
        }}
      >
        CHAT
      </Typography>
    </Box>
  )
}

export default Branding
