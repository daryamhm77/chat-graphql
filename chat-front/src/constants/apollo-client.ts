/**
 * Apollo Client setup for this app.
 * - Cookie credentials on HTTP (login sets Authentication)
 * - Bearer token on HTTP + websocket as a backup
 * - 401s on protected pages notify React to log the user out
 */
import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { getBearerToken } from '../auth/access-token.ts'
import { notifyUnauthorized } from '../auth/unauthorized.ts'
import { isPublicPath } from '../constants/public-paths.ts'
import { isUnauthorizedError } from '../utils/errors.ts'
import { API_URL, WS_URL } from './urls.ts'

const PUBLIC_OPERATIONS = new Set(['Login', 'CreateUser'])

const errorLink = new ErrorLink(({ error, operation }) => {
  if (!isUnauthorizedError(error)) {
    return
  }
  if (PUBLIC_OPERATIONS.has(operation.operationName ?? '')) {
    return
  }
  if (isPublicPath(window.location.pathname)) {
    return
  }
  notifyUnauthorized()
})

const authLink = new SetContextLink((prevContext) => {
  const token = getBearerToken()
  const previousHeaders =
    prevContext.headers && typeof prevContext.headers === 'object'
      ? prevContext.headers
      : {}

  return {
    headers: {
      ...previousHeaders,
      ...(token ? { authorization: token } : {}),
    },
  }
})

const httpLink = new HttpLink({
  uri: `${API_URL}/graphql`,
  credentials: 'include',
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${WS_URL}/graphql`,
    connectionParams: () => {
      const token = getBearerToken()
      return token ? { token } : {}
    },
  }),
)

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink,
)

const mergeBySkip = (
  existing: unknown[] | undefined,
  incoming: unknown[],
  { args }: { args: Record<string, unknown> | null },
) => {
  const merged = existing ? existing.slice(0) : []
  const skip = typeof args?.skip === 'number' ? args.skip : 0
  for (let i = 0; i < incoming.length; i += 1) {
    merged[skip + i] = incoming[i]
  }
  return merged
}

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            keyArgs: false,
            merge: mergeBySkip,
          },
          messages: {
            keyArgs: ['chatId'],
            merge: mergeBySkip,
          },
        },
      },
    },
  }),
  link: errorLink.concat(authLink).concat(splitLink),
})

export default client
