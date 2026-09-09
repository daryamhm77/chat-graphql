/** Loads the signed-in user from the `me` query. */
import { useQuery } from '@apollo/client/react'
import { ME_QUERY } from '../graphql/me.query.ts'

export const useGetMe = () => {
  return useQuery(ME_QUERY, {
    errorPolicy: 'all',
  })
}
