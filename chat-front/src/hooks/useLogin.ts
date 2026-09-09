import { useApolloClient, useMutation } from '@apollo/client/react'
import { setAccessToken } from '../auth/access-token.ts'
import { LOGIN_MUTATION, type LoginInput } from '../graphql/login.mutation.ts'
import { extractErrorMessage } from '../utils/errors.ts'

export const useLogin = () => {
  const client = useApolloClient()
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION)

  const login = async (loginInput: LoginInput) => {
    try {
      const result = await loginMutation({
        variables: { loginInput },
      })
      const token = result.data?.login
      if (!token) {
        throw new Error(extractErrorMessage(result.error))
      }
      setAccessToken(token)
      await client.refetchQueries({ include: ['Me'] })
    } catch (error) {
      throw new Error(extractErrorMessage(error))
    }
  }

  return { login, loading }
}
