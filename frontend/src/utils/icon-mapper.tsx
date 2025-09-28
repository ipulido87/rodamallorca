  // utils/iconMapper.tsx

  import {
    AccountBalance,
    Build,
    Dashboard,
    FavoriteBorder,
    Home,
    Inventory,
    People,
    Person,
    Settings,
    ShoppingCart,
    Store,
  } from '@mui/icons-material'

  const iconMap = {
    Dashboard,
    Inventory,
    Build,
    ShoppingCart,
    People,
    AccountBalance,
    Settings,
    Home,
    FavoriteBorder,
    Person,
    Store,
  }

  export const getIcon = (iconName: string): JSX.Element => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return IconComponent ? <IconComponent /> : <Home />
  }
