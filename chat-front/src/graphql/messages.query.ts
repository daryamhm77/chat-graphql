import { gql, type TypedDocumentNode } from '@apollo/client'
import { MESSAGE_FRAGMENT, type Message } from './message.fragment.ts'

export interface MessagesQueryVariables {
  chatId: string
  skip: number
  limit: number
}

export const MESSAGES_QUERY: TypedDocumentNode<
  { messages: Message[] },
  MessagesQueryVariables
> = gql`
  query Messages($chatId: String!, $skip: Int!, $limit: Int!) {
    messages(chatId: $chatId, skip: $skip, limit: $limit) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`
