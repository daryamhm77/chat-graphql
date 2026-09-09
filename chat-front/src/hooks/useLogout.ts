/** Tells the server to clear the cookie, then wipes local Apollo cache. */
import { useApolloClient, useMutation } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { clearAccessToken } from '../auth/access-token.ts'
import { LOGOUT_MUTATION } from '../graphql/logout.mutation.ts'

export const useLogout = () => {
  const client = useApolloClient()
  const navigate = useNavigate()
  const [logoutMutation, { loading }] = useMutation(LOGOUT_MUTATION)

  const logout = async () => {
    try {
      await logoutMutation()
    } finally {
      clearAccessToken()
      await client.clearStore()
      await navigate('/login', { replace: true })
    }
  }

  return { logout, loading }
}
