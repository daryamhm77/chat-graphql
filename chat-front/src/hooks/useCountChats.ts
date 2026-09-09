import { useCallback, useState } from 'react'
import { getBearerToken } from '../auth/access-token.ts'
import { API_URL } from '../constants/urls.ts'

export const useCountChats = () => {
  const [chatsCount, setChatsCount] = useState(0)

  const countChats = useCallback(async () => {
    const token = getBearerToken()
    const response = await fetch(`${API_URL}/chats/count`, {
      credentials: 'include',
      headers: token ? { authorization: token } : {},
    })
    if (!response.ok) {
      return
    }
    const data = (await response.json()) as { chats: number }
    setChatsCount(data.chats)
  }, [])

  return { chatsCount, countChats }
}
