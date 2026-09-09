/** Avatar menu: profile and log out. Uses the real user photo from `me`. */
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useGetMe } from '../../hooks/useGetMe.ts'
import { useLogout } from '../../hooks/useLogout.ts'
import { useSnackbar } from '../snackbar/snackbar-context.tsx'

const Settings = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const { data } = useGetMe()
  const { logout, loading } = useLogout()
  const { notify } = useSnackbar()
  const user = data?.me

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    closeMenu()
    try {
      await logout()
    } catch {
      notify({ message: 'Could not log out. Try again.', severity: 'error' })
    }
  }

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Account">
        <IconButton onClick={openMenu} sx={{ p: 0 }} aria-label="Account menu">
          <Avatar alt={user?.username ?? 'Account'} src={user?.imageUrl} />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem component={Link} to="/profile" onClick={closeMenu}>
          Profile
        </MenuItem>
        <MenuItem onClick={() => void handleLogout()} disabled={loading}>
          {loading ? 'Logging out…' : 'Log out'}
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Settings
