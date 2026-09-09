/** Nav links: hamburger on small screens, buttons on md+. */
import MenuIcon from '@mui/icons-material/Menu'
import {
  Badge,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useState, type MouseEvent } from 'react'
import { NavLink } from 'react-router-dom'
import type { NavPage } from '../../constants/nav-pages.ts'
import { useUnreadSummary } from '../../hooks/useUnreadSummary.ts'

interface NavigationProps {
  pages: NavPage[]
  showBadges?: boolean
}

const Navigation = ({ pages, showBadges = false }: NavigationProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const { data } = useUnreadSummary(showBadges)
  const summary = data?.unreadSummary

  const badgeFor = (page: NavPage) => {
    if (!showBadges || !page.badgeKey || !summary) {
      return 0
    }
    return page.badgeKey === 'direct' ? summary.direct : summary.group
  }

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="large"
          color="inherit"
          aria-label="Open navigation"
          aria-controls={anchorEl ? 'nav-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={anchorEl ? 'true' : undefined}
          onClick={openMenu}
        >
          <Badge
            color="error"
            badgeContent={summary?.total ?? 0}
            max={99}
            invisible={!showBadges || !(summary?.total ?? 0)}
          >
            <MenuIcon />
          </Badge>
        </IconButton>
        <Menu
          id="nav-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {pages.map((page) => {
            const count = badgeFor(page)
            return (
              <MenuItem
                key={page.path}
                component={NavLink}
                to={page.path}
                onClick={closeMenu}
              >
                <Badge
                  color="error"
                  badgeContent={count}
                  max={99}
                  invisible={!count}
                  sx={{ pr: count ? 1.5 : 0 }}
                >
                  <Typography sx={{ textAlign: 'center' }}>
                    {page.title}
                  </Typography>
                </Badge>
              </MenuItem>
            )
          })}
        </Menu>
      </Box>

      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
        {pages.map((page) => {
          const count = badgeFor(page)
          return (
            <Button
              key={page.path}
              component={NavLink}
              to={page.path}
              sx={{
                color: 'inherit',
                '&.active': {
                  textDecoration: 'underline',
                  textUnderlineOffset: 6,
                },
              }}
            >
              <Badge
                color="error"
                badgeContent={count}
                max={99}
                invisible={!count}
                sx={{ '& .MuiBadge-badge': { right: -8, top: 2 } }}
              >
                {page.title}
              </Badge>
            </Button>
          )
        })}
      </Box>
    </>
  )
}

export default Navigation
