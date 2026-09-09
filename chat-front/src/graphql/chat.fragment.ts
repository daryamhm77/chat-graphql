import { gql } from '@apollo/client'
import { MESSAGE_FRAGMENT, type Message } from './message.fragment.ts'
import type { User } from './user.fragment.ts'

export type ChatType = 'DIRECT' | 'GROUP'

export interface Chat {
  _id: string
  name: string | null
  type: ChatType
  participants: User[]
  latestMessage: Message | null
  unreadCount: number
}

export const CHAT_FRAGMENT = gql`
  fragment ChatFragment on Chat {
    _id
    name
    type
    unreadCount
    participants {
      ...UserFragment
    }
    latestMessage {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`
