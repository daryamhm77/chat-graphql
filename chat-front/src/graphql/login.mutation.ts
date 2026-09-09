import { gql, type TypedDocumentNode } from '@apollo/client'

export interface LoginInput {
  email: string
  password: string
}

export const LOGIN_MUTATION: TypedDocumentNode<
  { login: string },
  { loginInput: LoginInput }
> = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput)
  }
`
