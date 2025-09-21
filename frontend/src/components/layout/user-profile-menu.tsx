import { Logout, Person, Settings } from '@mui/icons-material'
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { UserProfileMenuProps } from '../../shared/types/layout'

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onLogout,
}) => {
  const navigate = useNavigate()

  const handleProfileClick = () => {
    navigate('/profile')
    onClose()
  }

  const handleSettingsClick = () => {
    navigate('/settings')
    onClose()
  }

  return (
    <Menu
      id="profile-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={handleProfileClick}>
        <ListItemIcon>
          <Person fontSize="small" />
        </ListItemIcon>
        <ListItemText>Mi Perfil</ListItemText>
      </MenuItem>

      <MenuItem onClick={handleSettingsClick}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        <ListItemText>Configuración</ListItemText>
      </MenuItem>

      <Divider />

      <MenuItem onClick={onLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        <ListItemText>Cerrar Sesión</ListItemText>
      </MenuItem>
    </Menu>
  )
}
