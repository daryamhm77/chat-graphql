/** Chrome around every route: header, page content, toasts, session expiry. */
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import UnauthorizedHandler from '../auth/UnauthorizedHandler.tsx'
import Header from './header/Header.tsx'
import Snackbar from './snackbar/Snackbar.tsx'

const networkPattern = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" fill="none">
  <circle cx="18" cy="24" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <circle cx="86" cy="16" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <circle cx="152" cy="38" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <circle cx="42" cy="88" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <circle cx="110" cy="78" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <circle cx="164" cy="112" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <circle cx="28" cy="148" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <circle cx="96" cy="150" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <circle cx="148" cy="164" r="1.6" fill="#8FB6D9" fill-opacity="0.45"/>
  <path d="M18 24L86 16L152 38L110 78L86 16M42 88L18 24M42 88L110 78L164 112M42 88L28 148L96 150L110 78M96 150L148 164L164 112" stroke="#8FB6D9" stroke-opacity="0.28" stroke-width="1"/>
</svg>
`)

const RootLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#EAF2FA',
        backgroundImage: `
          radial-gradient(circle at 10% 0%, rgba(255,255,255,0.9) 0%, transparent 40%),
          radial-gradient(circle at 90% 10%, rgba(107,176,255,0.28) 0%, transparent 35%),
          url("data:image/svg+xml,${networkPattern}")
        `,
        backgroundRepeat: 'no-repeat, no-repeat, repeat',
        backgroundSize: 'auto, auto, 180px 180px',
      }}
    >
      <UnauthorizedHandler />
      <Header />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Outlet />
      </Box>
      <Snackbar />
    </Box>
  )
}

export default RootLayout
