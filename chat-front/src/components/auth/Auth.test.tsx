import { ThemeProvider, createTheme } from '@mui/material'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Auth from './Auth.tsx'

const theme = createTheme({ palette: { mode: 'dark' } })

const renderAuth = (
  onSubmit: (credentials: { email: string; password: string }) => Promise<void> =
    async () => {},
) =>
  render(
    <ThemeProvider theme={theme}>
      <Auth title="Log in" submitLabel="Log in" onSubmit={onSubmit}>
        <span>Need an account?</span>
      </Auth>
    </ThemeProvider>,
  )

describe('Auth', () => {
  it('does not submit when the email is invalid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderAuth(onSubmit)

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'Abcdef1!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument()
  })

  it('submits trimmed credentials when the form is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderAuth(onSubmit)

    await user.type(screen.getByLabelText('Email'), ' ada@example.com ')
    await user.type(screen.getByLabelText('Password'), 'Abcdef1!')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'Abcdef1!',
    })
  })
})
