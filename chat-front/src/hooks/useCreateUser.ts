/** Runs the createUser mutation. */
import { useMutation } from '@apollo/client/react'
import { CREATE_USER_MUTATION } from '../graphql/create-user.mutation.ts'

export const useCreateUser = () => {
  return useMutation(CREATE_USER_MUTATION)
}
