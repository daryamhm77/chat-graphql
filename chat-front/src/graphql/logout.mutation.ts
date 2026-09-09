/** Clears the Authentication cookie on the server. */
import { gql, type TypedDocumentNode } from '@apollo/client'

export const LOGOUT_MUTATION: TypedDocumentNode<
  { logout: boolean },
  Record<string, never>
> = gql`
  mutation Logout {
    logout
  }
`
