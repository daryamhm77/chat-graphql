import { MockedProvider } from '@apollo/client/testing/react'
import { ThemeProvider, createTheme } from '@mui/material'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home.tsx'

const theme = createTheme({ palette: { mode: 'dark' } })

describe('Home', () => {
  it('renders the empty-state prompt', () => {
    render(
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={[]}>
          <MemoryRouter>
            <Home chatType="DIRECT" />
          </MemoryRouter>
        </MockedProvider>
      </ThemeProvider>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Select a direct chat or start a new one',
      }),
    ).toBeInTheDocument()
  })
})
