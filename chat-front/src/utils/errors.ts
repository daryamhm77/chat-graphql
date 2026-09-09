/** Turns Nest/Apollo errors into a single message we can show on the form. */
import { CombinedGraphQLErrors } from '@apollo/client'

const UNKNOWN_ERROR_MESSAGE =
  'An unknown error has occurred. Please try again later.'

interface NestOriginalError {
  message?: string | string[]
  statusCode?: number
}

const capitalize = (value: string) =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1)

const fromOriginalError = (originalError: unknown) => {
  if (!originalError || typeof originalError !== 'object') {
    return
  }

  const message = (originalError as NestOriginalError).message
  if (Array.isArray(message) && message[0]) {
    return capitalize(message[0])
  }
  if (typeof message === 'string' && message.length > 0) {
    return capitalize(message)
  }
}

export const extractErrorMessage = (error: unknown) => {
  if (CombinedGraphQLErrors.is(error)) {
    const [graphQLError] = error.errors
    const fromNest = fromOriginalError(graphQLError?.extensions?.originalError)
    if (fromNest) {
      return fromNest
    }
    if (graphQLError?.message) {
      return capitalize(graphQLError.message)
    }
  }

  if (error instanceof Error && error.message) {
    return capitalize(error.message)
  }

  return UNKNOWN_ERROR_MESSAGE
}

export const isUnauthorizedError = (error: unknown) => {
  if (!CombinedGraphQLErrors.is(error)) {
    return false
  }

  return error.errors.some((graphQLError) => {
    const originalError = graphQLError.extensions?.originalError as
      | NestOriginalError
      | undefined
    return (
      originalError?.statusCode === 401 ||
      graphQLError.extensions?.status === 401 ||
      graphQLError.message.toLowerCase().includes('unauthorized')
    )
  })
}

export { UNKNOWN_ERROR_MESSAGE }
