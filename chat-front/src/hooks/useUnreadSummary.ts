import { useQuery } from '@apollo/client/react'
import { UNREAD_SUMMARY_QUERY } from '../graphql/unread-summary.query.ts'

export const useUnreadSummary = (enabled = true) => {
  return useQuery(UNREAD_SUMMARY_QUERY, {
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
  })
}
