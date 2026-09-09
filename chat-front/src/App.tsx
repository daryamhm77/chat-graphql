import { ApolloProvider } from '@apollo/client/react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import { SnackbarProvider } from './components/snackbar/snackbar-context.tsx'
import router from './components/Routes.tsx'
import client from './constants/apollo-client.ts'

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2B7DE9',
      dark: '#1A4F8B',
      light: '#6BB0FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5BA3E8',
    },
    background: {
      default: '#EAF2FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F2744',
      secondary: '#5A718C',
    },
    divider: 'rgba(43, 125, 233, 0.12)',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily:
      '"SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#EAF2FA',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.86)',
          color: '#0F2744',
          boxShadow: '0 1px 0 rgba(15, 55, 100, 0.06)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
        contained: {
          boxShadow: '0 8px 20px rgba(43, 125, 233, 0.28)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 8px 28px rgba(15, 55, 100, 0.08)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: 16,
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: 'rgba(43, 125, 233, 0.22)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: 'rgba(43, 125, 233, 0.45)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: '#2B7DE9',
          },
        },
      },
    },
  },
})

const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default App
