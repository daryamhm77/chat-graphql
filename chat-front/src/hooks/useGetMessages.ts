import { useQuery } from '@apollo/client/react'
import {
  MESSAGES_QUERY,
  type MessagesQueryVariables,
} from '../graphql/messages.query.ts'

export const useGetMessages = (variables: MessagesQueryVariables) => {
  return useQuery(MESSAGES_QUERY, { variables })
}
