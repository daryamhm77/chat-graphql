/** Asks the API who the current cookie/session belongs to. */
import { gql, type TypedDocumentNode } from '@apollo/client'
import { USER_FRAGMENT, type User } from './user.fragment.ts'

export const ME_QUERY: TypedDocumentNode<{ me: User }, Record<string, never>> =
  gql`
    query Me {
      me {
        ...UserFragment
      }
    }
    ${USER_FRAGMENT}
  `
