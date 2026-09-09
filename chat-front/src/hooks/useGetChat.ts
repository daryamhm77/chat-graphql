import { useQuery } from '@apollo/client/react'
import {
  CHAT_QUERY,
  type ChatQueryVariables,
} from '../graphql/chat.query.ts'

export const useGetChat = (variables: ChatQueryVariables) => {
  return useQuery(CHAT_QUERY, { variables })
}
