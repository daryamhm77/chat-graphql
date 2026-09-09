import { CombinedGraphQLErrors } from '@apollo/client'
import { extractErrorMessage, isUnauthorizedError } from './errors.ts'

describe('extractErrorMessage', () => {
  it('reads Nest originalError message arrays', () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Bad Request Exception',
          extensions: {
            originalError: {
              message: ['email must be an email'],
              statusCode: 400,
            },
          },
        },
      ],
    })

    expect(extractErrorMessage(error)).toBe('Email must be an email')
  })

  it('reads a single Nest originalError message', () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Unauthorized',
          extensions: {
            originalError: {
              message: 'Credentials are not valid.',
              statusCode: 401,
            },
          },
        },
      ],
    })

    expect(extractErrorMessage(error)).toBe('Credentials are not valid.')
  })
})

describe('isUnauthorizedError', () => {
  it('detects a 401 Nest originalError', () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Unauthorized',
          extensions: {
            originalError: { statusCode: 401 },
          },
        },
      ],
    })

    expect(isUnauthorizedError(error)).toBe(true)
  })
})
