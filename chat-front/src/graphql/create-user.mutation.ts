import { gql, type TypedDocumentNode } from '@apollo/client'

export interface CreateUserInput {
  email: string
  username: string
  password: string
}

export const CREATE_USER_MUTATION: TypedDocumentNode<
  { createUser: { _id: string; email: string; username: string } },
  { createUserInput: CreateUserInput }
> = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      _id
      email
      username
    }
  }
`
