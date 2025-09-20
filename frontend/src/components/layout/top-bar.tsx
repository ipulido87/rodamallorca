import { Menu as MenuIcon } from '@mui/icons-material'
import { AppBar, Avatar, IconButton, Toolbar, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../../hooks/use-auth' // Ajustar ruta según donde tengas el hook
import { TopBarProps } from '../../types/layout'
import { UserProfileMenu } from './user-profile-menu'

const DRAWER_WIDTH = 280

export const TopBar: React.FC<TopBarProps> = ({
  onMenuClick,
  currentPageTitle,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, logout } = useAuth()

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleProfileMenuClose()
    logout() // Tu logout no es async según el tipo
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentPageTitle}
          </Typography>

          {/* Profile Avatar */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <UserProfileMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onLogout={handleLogout}
      />
    </>
  )
}
