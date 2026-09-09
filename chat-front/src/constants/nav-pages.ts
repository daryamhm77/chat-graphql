export interface NavPage {
  title: string
  path: string
  badgeKey?: 'direct' | 'group'
}

export const AUTHENTICATED_PAGES: NavPage[] = [
  { title: 'Direct', path: '/direct', badgeKey: 'direct' },
  { title: 'Group', path: '/groups', badgeKey: 'group' },
]

export const PUBLIC_PAGES: NavPage[] = [
  { title: 'Log in', path: '/login' },
  { title: 'Sign up', path: '/signup' },
]
