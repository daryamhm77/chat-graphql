/** Login page: email + password, then redirect happens via PublicOnlyRoute. */
import { Link as MuiLink } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../../hooks/useLogin.ts'
import Auth from './Auth.tsx'

const Login = () => {
  const { login, loading } = useLogin()
  const [error, setError] = useState<string>()

  return (
    <Auth
      title="Log in"
      submitLabel="Log in"
      submitting={loading}
      error={error}
      passwordHint="Enter the password for your account."
      onSubmit={async (credentials) => {
        try {
          setError(undefined)
          await login(credentials)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not log in.')
        }
      }}
    >
      <MuiLink component={Link} to="/signup" sx={{ alignSelf: 'center' }}>
        Need an account? Sign up
      </MuiLink>
    </Auth>
  )
}

export default Login
