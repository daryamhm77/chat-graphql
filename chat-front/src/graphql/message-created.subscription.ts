import { gql, type TypedDocumentNode } from '@apollo/client'
import { MESSAGE_FRAGMENT, type Message } from './message.fragment.ts'

export const MESSAGE_CREATED_SUBSCRIPTION: TypedDocumentNode<
  { messageCreated: Message },
  { chatIds: string[] }
> = gql`
  subscription MessageCreated($chatIds: [String!]!) {
    messageCreated(chatIds: $chatIds) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`
