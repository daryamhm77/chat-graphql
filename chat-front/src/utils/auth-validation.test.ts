import { validateEmail, validatePassword, validateUsername } from './auth-validation.ts'

describe('auth validation', () => {
  it('rejects a weak password', () => {
    expect(validatePassword('password')).toBe(
      'Password must include an uppercase letter.',
    )
  })

  it('accepts a strong password', () => {
    expect(validatePassword('Abcdef1!')).toBeUndefined()
  })

  it('requires a username', () => {
    expect(validateUsername('  ')).toBe('Username is required.')
  })

  it('requires a valid email', () => {
    expect(validateEmail('ada')).toBe('Enter a valid email.')
  })
})
