import { useMutation } from '@apollo/client/react'
import { prependChat } from '../cache/messages.ts'
import {
  CREATE_GROUP_CHAT_MUTATION,
  type CreateGroupChatInput,
} from '../graphql/create-group-chat.mutation.ts'
import { extractErrorMessage } from '../utils/errors.ts'

export const useCreateGroupChat = () => {
  const [mutate, { loading }] = useMutation(CREATE_GROUP_CHAT_MUTATION, {
    update(cache, { data }) {
      if (data?.createGroupChat) {
        prependChat(cache, data.createGroupChat)
      }
    },
  })

  const createGroupChat = async (createGroupChatInput: CreateGroupChatInput) => {
    try {
      const result = await mutate({ variables: { createGroupChatInput } })
      const chat = result.data?.createGroupChat
      if (!chat) {
        throw new Error(extractErrorMessage(result.error))
      }
      return chat
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  return { createGroupChat, loading }
}
