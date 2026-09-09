import type { ApolloCache, Reference } from '@apollo/client'
import { PAGE_SIZE } from '../constants/page-size.ts'
import { MESSAGE_FRAGMENT, type Message } from '../graphql/message.fragment.ts'
import { MESSAGES_QUERY } from '../graphql/messages.query.ts'

export const updateMessages = (cache: ApolloCache, message: Message) => {
  const messagesQueryOptions = {
    query: MESSAGES_QUERY,
    variables: {
      chatId: message.chatId,
      skip: 0,
      limit: PAGE_SIZE,
    },
  }

  const existing = cache.readQuery(messagesQueryOptions)
  if (!existing) {
    return
  }

  if (existing.messages.some((cached) => cached._id === message._id)) {
    return
  }

  cache.writeQuery({
    ...messagesQueryOptions,
    data: {
      messages: [...existing.messages, message],
    },
  })
}

export const updateLatestMessage = (cache: ApolloCache, message: Message) => {
  const messageRef = cache.writeFragment({
    fragment: MESSAGE_FRAGMENT,
    fragmentName: 'MessageFragment',
    data: {
      __typename: 'Message',
      ...message,
      user: {
        __typename: 'User',
        ...message.user,
      },
    },
  })

  cache.modify({
    id: cache.identify({ __typename: 'Chat', _id: message.chatId }),
    fields: {
      latestMessage() {
        return messageRef
      },
    },
  })
}

export const incrementChatUnread = (cache: ApolloCache, chatId: string) => {
  cache.modify({
    id: cache.identify({ __typename: 'Chat', _id: chatId }),
    fields: {
      unreadCount(existing: number = 0) {
        return existing + 1
      },
    },
  })
}

export const clearChatUnread = (cache: ApolloCache, chatId: string) => {
  cache.modify({
    id: cache.identify({ __typename: 'Chat', _id: chatId }),
    fields: {
      unreadCount() {
        return 0
      },
    },
  })
}

export const prependChat = (cache: ApolloCache, chat: { _id: string }) => {
  cache.modify({
    fields: {
      chats(existing: readonly Reference[] = [], { toReference, readField }) {
        const alreadyPresent = existing.some(
          (ref) => readField('_id', ref) === chat._id,
        )
        if (alreadyPresent) {
          return existing
        }

        const chatRef = toReference({
          __typename: 'Chat',
          _id: chat._id,
        })
        if (!chatRef) {
          return existing
        }

        return [chatRef, ...existing]
      },
    },
  })
}
