import { useQuery } from '@apollo/client/react'
import {
  CHATS_QUERY,
  type ChatsQueryVariables,
} from '../graphql/chats.query.ts'

export const useGetChats = (variables: ChatsQueryVariables) => {
  return useQuery(CHATS_QUERY, { variables })
}
