import { useMutation } from '@apollo/client/react'
import { prependChat } from '../cache/messages.ts'
import { START_DIRECT_CHAT_MUTATION } from '../graphql/start-direct-chat.mutation.ts'
import { extractErrorMessage } from '../utils/errors.ts'

export const useStartDirectChat = () => {
  const [mutate, { loading }] = useMutation(START_DIRECT_CHAT_MUTATION, {
    update(cache, { data }) {
      if (data?.startDirectChat) {
        prependChat(cache, data.startDirectChat)
      }
    },
  })

  const startDirectChat = async (userId: string) => {
    try {
      const result = await mutate({ variables: { userId } })
      const chat = result.data?.startDirectChat
      if (!chat) {
        throw new Error(extractErrorMessage(result.error))
      }
      return chat
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  return { startDirectChat, loading }
}
