/**
 * Listens for 401s from Apollo and performs a client-side logout.
 * Rendered once inside the router so it can navigate.
 */
import { useApolloClient } from '@apollo/client/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAccessToken } from './access-token.ts'
import { onUnauthorized } from './unauthorized.ts'

const UnauthorizedHandler = () => {
  const client = useApolloClient()
  const navigate = useNavigate()

  useEffect(() => {
    return onUnauthorized(() => {
      clearAccessToken()
      void client.clearStore()
      void navigate('/login', { replace: true })
    })
  }, [client, navigate])

  return null
}

export default UnauthorizedHandler
