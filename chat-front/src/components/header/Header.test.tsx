import { MockedProvider } from '@apollo/client/testing/react'
import { ThemeProvider, createTheme } from '@mui/material'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SnackbarProvider } from '../snackbar/snackbar-context.tsx'
import Header from './Header.tsx'

const theme = createTheme({ palette: { mode: 'dark' } })

describe('Header', () => {
  it('shows public links when logged out', () => {
    render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <MemoryRouter>
              <Header />
            </MemoryRouter>
          </MockedProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    )

    expect(
      screen.getAllByRole('link', { name: 'Chat home' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: 'Log in' }).length,
    ).toBeGreaterThan(0)
  })
})
