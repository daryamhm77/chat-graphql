/**
 * Lets the Apollo error link tell React to clear the session and go to login
 * without importing the router (avoids a circular dependency).
 */
type UnauthorizedListener = () => void

const listeners = new Set<UnauthorizedListener>()

export const onUnauthorized = (listener: UnauthorizedListener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const notifyUnauthorized = () => {
  for (const listener of listeners) {
    listener()
  }
}
