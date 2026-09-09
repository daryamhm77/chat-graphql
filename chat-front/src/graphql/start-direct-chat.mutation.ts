import { gql, type TypedDocumentNode } from '@apollo/client'
import { CHAT_FRAGMENT, type Chat } from './chat.fragment.ts'

export const START_DIRECT_CHAT_MUTATION: TypedDocumentNode<
  { startDirectChat: Chat },
  { userId: string }
> = gql`
  mutation StartDirectChat($userId: String!) {
    startDirectChat(userId: $userId) {
      ...ChatFragment
    }
  }
  ${CHAT_FRAGMENT}
`
