import { gql, type TypedDocumentNode } from '@apollo/client'
import { CHAT_FRAGMENT, type Chat } from './chat.fragment.ts'

export interface ChatsQueryVariables {
  skip: number
  limit: number
}

export const CHATS_QUERY: TypedDocumentNode<
  { chats: Chat[] },
  ChatsQueryVariables
> = gql`
  query Chats($skip: Int!, $limit: Int!) {
    chats(skip: $skip, limit: $limit) {
      ...ChatFragment
    }
  }
  ${CHAT_FRAGMENT}
`
