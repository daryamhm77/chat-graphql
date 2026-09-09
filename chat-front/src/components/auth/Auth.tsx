/**
 * Shared email/password form used by Login and Signup.
 * Handles submit-on-Enter, field errors, and the loading state.
 */
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { type FormEvent, type ReactNode, useState } from 'react'
import {
  validateEmail,
  validatePasswordRequired,
} from '../../utils/auth-validation.ts'

export interface AuthCredentials {
  email: string
  password: string
}

interface AuthProps {
  title: string
  submitLabel: string
  onSubmit: (credentials: AuthCredentials) => Promise<void>
  extraFields?: ReactNode
  afterPasswordFields?: ReactNode
  children: ReactNode
  submitting?: boolean
  error?: string
  passwordHint?: string
  validatePasswordField?: (password: string) => string | undefined
}

const Auth = ({
  title,
  submitLabel,
  onSubmit,
  extraFields,
  afterPasswordFields,
  children,
  submitting = false,
  error,
  passwordHint,
  validatePasswordField = validatePasswordRequired,
}: AuthProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextEmailError = validateEmail(email)
    const nextPasswordError = validatePasswordField(password)
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)

    if (nextEmailError || nextPasswordError) {
      return
    }

    await onSubmit({ email: email.trim(), password })
  }

  return (
    <Box
      sx={{
        minHeight: { xs: 'calc(100svh - 56px)', sm: 'calc(100svh - 64px)' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background: `
          radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.95) 0%, transparent 42%),
          radial-gradient(circle at 88% 12%, rgba(107, 176, 255, 0.55) 0%, transparent 38%),
          radial-gradient(circle at 70% 85%, rgba(26, 79, 139, 0.55) 0%, transparent 45%),
          linear-gradient(145deg, #FFFFFF 0%, #B7D9F8 42%, #2B7DE9 72%, #123A6B 100%)
        `,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 24px 60px rgba(18, 58, 107, 0.22)',
        }}
      >
        <Stack
          component="form"
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
          spacing={2.5}
          noValidate
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: 'primary.dark' }}
          >
            {title}
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            type="email"
            name="email"
            label="Email"
            autoComplete="email"
            autoFocus
            fullWidth
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (emailError) {
                setEmailError(undefined)
              }
            }}
            error={Boolean(emailError)}
            helperText={emailError ?? ' '}
            disabled={submitting}
          />
          {extraFields}
          <TextField
            type={showPassword ? 'text' : 'password'}
            name="password"
            label="Password"
            autoComplete={
              submitLabel === 'Sign up' ? 'new-password' : 'current-password'
            }
            fullWidth
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (passwordError) {
                setPasswordError(undefined)
              }
            }}
            error={Boolean(passwordError)}
            helperText={passwordError ?? passwordHint ?? ' '}
            disabled={submitting}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {afterPasswordFields}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            sx={{ py: 1.25 }}
          >
            {submitting ? 'Please wait…' : submitLabel}
          </Button>
          {children}
        </Stack>
      </Paper>
    </Box>
  )
}

export default Auth
