import { Button, ThemeProvider, createTheme } from '@mui/material'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Snackbar from './Snackbar.tsx'
import { SnackbarProvider, useSnackbar } from './snackbar-context.tsx'

const theme = createTheme({ palette: { mode: 'dark' } })

const Trigger = () => {
  const { notify } = useSnackbar()
  return (
    <Button
      onClick={() => notify({ message: 'Photo updated.', severity: 'success' })}
    >
      Toast
    </Button>
  )
}

describe('Snackbar', () => {
  it('shows a notice after notify()', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <Trigger />
          <Snackbar />
        </SnackbarProvider>
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Toast' }))
    expect(await screen.findByText('Photo updated.')).toBeInTheDocument()
  })
})
