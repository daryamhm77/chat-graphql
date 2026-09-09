import { gql, type TypedDocumentNode } from '@apollo/client'
import { CHAT_FRAGMENT, type Chat } from './chat.fragment.ts'

export interface CreateGroupChatInput {
  name: string
  participantIds: string[]
}

export const CREATE_GROUP_CHAT_MUTATION: TypedDocumentNode<
  { createGroupChat: Chat },
  { createGroupChatInput: CreateGroupChatInput }
> = gql`
  mutation CreateGroupChat($createGroupChatInput: CreateGroupChatInput!) {
    createGroupChat(createGroupChatInput: $createGroupChatInput) {
      ...ChatFragment
    }
  }
  ${CHAT_FRAGMENT}
`
