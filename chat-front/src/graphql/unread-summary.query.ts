import { gql, type TypedDocumentNode } from '@apollo/client'

export interface UnreadSummary {
  direct: number
  group: number
  total: number
}

export const UNREAD_SUMMARY_QUERY: TypedDocumentNode<
  { unreadSummary: UnreadSummary },
  Record<string, never>
> = gql`
  query UnreadSummary {
    unreadSummary {
      direct
      group
      total
    }
  }
`
