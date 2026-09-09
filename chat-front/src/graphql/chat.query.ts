import { gql, type TypedDocumentNode } from '@apollo/client'
import { CHAT_FRAGMENT, type Chat } from './chat.fragment.ts'

export interface ChatQueryVariables {
  _id: string
}

export const CHAT_QUERY: TypedDocumentNode<
  { chat: Chat },
  ChatQueryVariables
> = gql`
  query Chat($_id: String!) {
    chat(_id: $_id) {
      ...ChatFragment
    }
  }
  ${CHAT_FRAGMENT}
`
