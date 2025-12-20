// config/menuItems.ts

import type { MenuItem, UserRole } from '../types/layout'

export const menuItems: MenuItem[] = [
  // Menú para Talleres (WORKSHOP_OWNER)
  {
    id: 'dashboard',
    text: 'Dashboard',
    icon: 'Dashboard',
    path: '/dashboard',
    roles: ['WORKSHOP_OWNER', 'ADMIN'],
  },
  {
    id: 'my-products',
    text: 'Mis Productos',
    icon: 'Inventory',
    path: '/my-products',
    roles: ['WORKSHOP_OWNER'],
  },
  {
    id: 'services',
    text: 'Servicios',
    icon: 'Build',
    path: '/services',
    roles: ['WORKSHOP_OWNER'],
  },
  {
    id: 'orders',
    text: 'Pedidos',
    icon: 'ShoppingCart',
    path: '/orders',
    roles: ['WORKSHOP_OWNER'],
  },
  {
    id: 'customers',
    text: 'Clientes',
    icon: 'People',
    path: '/customers',
    roles: ['WORKSHOP_OWNER'],
  },
  {
    id: 'billing',
    text: 'Facturación',
    icon: 'AccountBalance',
    path: '/billing',
    roles: ['WORKSHOP_OWNER'],
  },
  {
    id: 'my-workshops',
    text: 'Mis Talleres',
    icon: 'Build',
    path: '/my-workshops',
    roles: ['WORKSHOP_OWNER'],
  },

  // Menú para Clientes (USER)
  {
    id: 'home',
    text: 'Inicio',
    icon: 'Home',
    path: '/home',
    roles: ['USER'],
  },
  {
    id: 'catalog',
    text: 'Catálogo',
    icon: 'Store',
    path: '/catalog',
    roles: ['USER', 'WORKSHOP_OWNER'],
  },
  {
    id: 'my-orders',
    text: 'Mis Pedidos',
    icon: 'ShoppingCart',
    path: '/my-orders',
    roles: ['USER', 'WORKSHOP_OWNER'],
  },
  {
    id: 'favorites',
    text: 'Favoritos',
    icon: 'FavoriteBorder',
    path: '/favorites',
    roles: ['USER'],
  },
  {
    id: 'repairs',
    text: 'Reparaciones',
    icon: 'Build',
    path: '/repairs',
    roles: ['USER'],
  },
]

// Función helper para filtrar menús por rol
export const getMenuItemsForRole = (userRole: UserRole): MenuItem[] => {
  return menuItems.filter((item) => item.roles.includes(userRole))
}
