import { useCallback, useState } from 'react'
import { getBearerToken } from '../auth/access-token.ts'
import { API_URL } from '../constants/urls.ts'

export const useCountMessages = (chatId: string) => {
  const [messagesCount, setMessagesCount] = useState(0)

  const countMessages = useCallback(async () => {
    if (!chatId) {
      return
    }
    const token = getBearerToken()
    const response = await fetch(
      `${API_URL}/messages/count?chatId=${encodeURIComponent(chatId)}`,
      {
        credentials: 'include',
        headers: token ? { authorization: token } : {},
      },
    )
    if (!response.ok) {
      return
    }
    const data = (await response.json()) as { messages: number }
    setMessagesCount(data.messages)
  }, [chatId])

  return { messagesCount, countMessages }
}
