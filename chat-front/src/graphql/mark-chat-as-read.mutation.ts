import { gql, type TypedDocumentNode } from '@apollo/client'
import { CHAT_FRAGMENT, type Chat } from './chat.fragment.ts'

export const MARK_CHAT_AS_READ_MUTATION: TypedDocumentNode<
  { markChatAsRead: Chat },
  { chatId: string }
> = gql`
  mutation MarkChatAsRead($chatId: String!) {
    markChatAsRead(chatId: $chatId) {
      ...ChatFragment
    }
  }
  ${CHAT_FRAGMENT}
`
