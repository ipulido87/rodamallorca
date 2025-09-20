// types/layout.ts

export type UserRole = 'USER' | 'WORKSHOP_OWNER' | 'ADMIN'

export interface MenuItem {
  id: string
  text: string
  icon: string // Nombre del icono para mantenerlo desacoplado
  path: string
  roles: UserRole[]
}

export interface SidebarProps {
  open: boolean
  onClose: () => void
  menuItems: MenuItem[]
}

export interface TopBarProps {
  onMenuClick: () => void
  currentPageTitle: string
}

export interface UserProfileMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onLogout: () => void
}

export interface MainLayoutProps {
  children?: React.ReactNode
}
