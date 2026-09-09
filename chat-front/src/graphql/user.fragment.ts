import { gql } from '@apollo/client'

export interface User {
  _id: string
  email: string
  username: string
  imageUrl: string
}

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    _id
    email
    username
    imageUrl
  }
`
