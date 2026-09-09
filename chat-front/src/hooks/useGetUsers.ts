import { useQuery } from '@apollo/client/react'
import { USERS_QUERY } from '../graphql/users.query.ts'

export const useGetUsers = () => {
  return useQuery(USERS_QUERY)
}
