/** Top bar for every page. Nav items change based on whether `me` resolved. */
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import {
  AUTHENTICATED_PAGES,
  PUBLIC_PAGES,
} from '../../constants/nav-pages.ts'
import { useGetMe } from '../../hooks/useGetMe.ts'
import Branding from './Branding.tsx'
import Navigation from './Navigation.tsx'
import Settings from './Settings.tsx'

const Header = () => {
  const { data } = useGetMe()
  const authenticated = Boolean(data?.me)
  const pages = authenticated ? AUTHENTICATED_PAGES : PUBLIC_PAGES

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Branding variant="desktop" />
          <Navigation pages={pages} showBadges={authenticated} />
          <Branding variant="mobile" />
          {authenticated ? <Settings /> : null}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
