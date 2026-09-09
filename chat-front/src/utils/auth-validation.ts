/** Client-side checks so we don't send obviously invalid auth forms. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email: string) => {
  if (!email.trim()) {
    return 'Email is required.'
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email.'
  }
}

export const validateUsername = (username: string) => {
  if (!username.trim()) {
    return 'Username is required.'
  }
  if (username.trim().length < 2) {
    return 'Username must be at least 2 characters.'
  }
}

export const validatePasswordRequired = (password: string) => {
  if (!password) {
    return 'Password is required.'
  }
}

export const validatePassword = (password: string) => {
  const requiredError = validatePasswordRequired(password)
  if (requiredError) {
    return requiredError
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters.'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must include a lowercase letter.'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include an uppercase letter.'
  }
  if (!/\d/.test(password)) {
    return 'Password must include a number.'
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include a symbol.'
  }
}

export const PASSWORD_HINT =
  'Use 8+ characters with upper and lower case, a number, and a symbol.'
