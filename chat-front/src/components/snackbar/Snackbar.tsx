/** Global MUI toast. Shown from RootLayout; content comes from useSnackbar(). */
import { Alert, Snackbar as MuiSnackbar } from '@mui/material'
import type { SyntheticEvent } from 'react'
import { useSnackbar } from './snackbar-context.tsx'

const Snackbar = () => {
  const { snack, clear } = useSnackbar()

  const handleClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    clear()
  }

  return (
    <MuiSnackbar
      open={Boolean(snack)}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {snack ? (
        <Alert
          onClose={handleClose}
          severity={snack.severity}
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      ) : undefined}
    </MuiSnackbar>
  )
}

export default Snackbar
