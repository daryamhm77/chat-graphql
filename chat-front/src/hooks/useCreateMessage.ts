import { useMutation } from '@apollo/client/react'
import { updateLatestMessage, updateMessages } from '../cache/messages.ts'
import {
  CREATE_MESSAGE_MUTATION,
  type CreateMessageInput,
} from '../graphql/create-message.mutation.ts'
import { extractErrorMessage } from '../utils/errors.ts'

export const useCreateMessage = () => {
  const [mutate, { loading }] = useMutation(CREATE_MESSAGE_MUTATION, {
    update(cache, { data }) {
      if (data?.createMessage) {
        updateMessages(cache, data.createMessage)
        updateLatestMessage(cache, data.createMessage)
      }
    },
  })

  const createMessage = async (createMessageInput: CreateMessageInput) => {
    try {
      const result = await mutate({ variables: { createMessageInput } })
      const message = result.data?.createMessage
      if (!message) {
        throw new Error(extractErrorMessage(result.error))
      }
      return message
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  return { createMessage, loading }
}
