import { gql, type TypedDocumentNode } from '@apollo/client'
import { USER_FRAGMENT, type User } from './user.fragment.ts'

export const USERS_QUERY: TypedDocumentNode<
  { users: User[] },
  Record<string, never>
> = gql`
  query Users {
    users {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`
