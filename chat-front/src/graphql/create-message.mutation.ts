import { gql, type TypedDocumentNode } from '@apollo/client'
import { MESSAGE_FRAGMENT, type Message } from './message.fragment.ts'

export interface CreateMessageInput {
  content?: string
  chatId: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentMimeType?: string
}

export const CREATE_MESSAGE_MUTATION: TypedDocumentNode<
  { createMessage: Message },
  { createMessageInput: CreateMessageInput }
> = gql`
  mutation CreateMessage($createMessageInput: CreateMessageInput!) {
    createMessage(createMessageInput: $createMessageInput) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`
