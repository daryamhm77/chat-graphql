let accessToken = ''

export const setAccessToken = (token: string) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

export const clearAccessToken = () => {
  accessToken = ''
}

export const getBearerToken = () => {
  const token = getAccessToken()
  if (!token) {
    return ''
  }
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}
