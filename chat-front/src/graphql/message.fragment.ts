import { gql } from '@apollo/client'
import { USER_FRAGMENT, type User } from './user.fragment.ts'

export interface Message {
  _id: string
  content: string
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentMimeType?: string | null
  createdAt: string
  chatId: string
  user: User
}

export const MESSAGE_FRAGMENT = gql`
  fragment MessageFragment on Message {
    _id
    content
    attachmentUrl
    attachmentName
    attachmentMimeType
    createdAt
    chatId
    user {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`
