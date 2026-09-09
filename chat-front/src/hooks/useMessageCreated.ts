import { useSubscription } from '@apollo/client/react'
import {
  incrementChatUnread,
  updateLatestMessage,
  updateMessages,
} from '../cache/messages.ts'
import { MARK_CHAT_AS_READ_MUTATION } from '../graphql/mark-chat-as-read.mutation.ts'
import { MESSAGE_CREATED_SUBSCRIPTION } from '../graphql/message-created.subscription.ts'
import { UNREAD_SUMMARY_QUERY } from '../graphql/unread-summary.query.ts'
import { useSnackbar } from '../components/snackbar/snackbar-context.tsx'

interface UseMessageCreatedOptions {
  selectedChatId?: string
  meId?: string
}

export const useMessageCreated = (
  chatIds: string[],
  { selectedChatId, meId }: UseMessageCreatedOptions = {},
) => {
  const { notify } = useSnackbar()

  useSubscription(MESSAGE_CREATED_SUBSCRIPTION, {
    variables: { chatIds },
    skip: chatIds.length === 0,
    onData({ client, data }) {
      const message = data.data?.messageCreated
      if (!message) {
        return
      }

      updateMessages(client.cache, message)
      updateLatestMessage(client.cache, message)

      const isOwn = meId != null && message.user._id === meId
      const isActiveChat =
        selectedChatId != null && message.chatId === selectedChatId

      if (isOwn) {
        return
      }

      if (isActiveChat) {
        void client.mutate({
          mutation: MARK_CHAT_AS_READ_MUTATION,
          variables: { chatId: message.chatId },
          refetchQueries: [{ query: UNREAD_SUMMARY_QUERY }],
        })
        return
      }

      incrementChatUnread(client.cache, message.chatId)
      void client.refetchQueries({ include: [UNREAD_SUMMARY_QUERY] })

      const preview =
        message.content?.trim() ||
        (message.attachmentName
          ? `Sent ${message.attachmentName}`
          : 'Sent an attachment')

      notify({
        message: `${message.user.username}: ${preview}`,
        severity: 'info',
      })
    },
  })
}
