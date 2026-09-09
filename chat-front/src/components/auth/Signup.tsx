/** Signup page: creates the user, then logs them in with the same credentials. */
import { Link as MuiLink, TextField } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCreateUser } from '../../hooks/useCreateUser.ts'
import { useLogin } from '../../hooks/useLogin.ts'
import { extractErrorMessage } from '../../utils/errors.ts'
import {
  PASSWORD_HINT,
  validatePassword,
  validateUsername,
} from '../../utils/auth-validation.ts'
import Auth from './Auth.tsx'

const Signup = () => {
  const [createUser, { loading: creating }] = useCreateUser()
  const { login, loading: loggingIn } = useLogin()
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [usernameError, setUsernameError] = useState<string>()
  const [confirmError, setConfirmError] = useState<string>()
  const [error, setError] = useState<string>()
  const submitting = creating || loggingIn

  return (
    <Auth
      title="Create account"
      submitLabel="Sign up"
      submitting={submitting}
      error={error}
      passwordHint={PASSWORD_HINT}
      validatePasswordField={validatePassword}
      extraFields={
        <TextField
          type="text"
          name="username"
          label="Username"
          autoComplete="username"
          fullWidth
          value={username}
          onChange={(event) => {
            setUsername(event.target.value)
            if (usernameError) {
              setUsernameError(undefined)
            }
          }}
          error={Boolean(usernameError)}
          helperText={usernameError ?? ' '}
          disabled={submitting}
        />
      }
      afterPasswordFields={
        <TextField
          type="password"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          fullWidth
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            if (confirmError) {
              setConfirmError(undefined)
            }
          }}
          error={Boolean(confirmError)}
          helperText={confirmError ?? ' '}
          disabled={submitting}
        />
      }
      onSubmit={async ({ email, password }) => {
        const nextUsernameError = validateUsername(username)
        const nextConfirmError =
          confirmPassword !== password ? 'Passwords do not match.' : undefined
        setUsernameError(nextUsernameError)
        setConfirmError(nextConfirmError)
        setError(undefined)

        if (nextUsernameError || nextConfirmError) {
          return
        }

        try {
          await createUser({
            variables: {
              createUserInput: {
                email,
                username: username.trim(),
                password,
              },
            },
          })
          await login({ email, password })
        } catch (err) {
          setError(extractErrorMessage(err))
        }
      }}
    >
      <MuiLink component={Link} to="/login" sx={{ alignSelf: 'center' }}>
        Already have an account? Log in
      </MuiLink>
    </Auth>
  )
}

export default Signup
