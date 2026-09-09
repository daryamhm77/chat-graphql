/** Paths that anyone can visit without a session. */
export const PUBLIC_PATHS = ['/login', '/signup'] as const

export type PublicPath = (typeof PUBLIC_PATHS)[number]

export const isPublicPath = (path: string) =>
  PUBLIC_PATHS.includes(path as PublicPath)
