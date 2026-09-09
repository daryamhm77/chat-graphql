import { useCallback } from 'react'
import { useMutation } from '@apollo/client/react'
import { clearChatUnread } from '../cache/messages.ts'
import { MARK_CHAT_AS_READ_MUTATION } from '../graphql/mark-chat-as-read.mutation.ts'
import { UNREAD_SUMMARY_QUERY } from '../graphql/unread-summary.query.ts'

export const useMarkChatAsRead = () => {
  const [markChatAsReadMutation, state] = useMutation(MARK_CHAT_AS_READ_MUTATION)

  const markChatAsRead = useCallback(
    async (chatId: string) => {
      await markChatAsReadMutation({
        variables: { chatId },
        update(cache) {
          clearChatUnread(cache, chatId)
        },
        refetchQueries: [{ query: UNREAD_SUMMARY_QUERY }],
      })
    },
    [markChatAsReadMutation],
  )

  return { markChatAsRead, ...state }
}
