import {
  Build,
  Business,
  Favorite,
  FavoriteBorder,
  LocationOn,
  MoreVert,
  Schedule,
  ShoppingCart,
  Store,
  TwoWheeler,
  Visibility,
} from '@mui/icons-material'
import {
  Alert,
  alpha,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Fade,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type {
  CardProduct,
  CardService,
  CardWorkshop,
  ModernLayoutCommonProps,
  OnOpenMenuHandler,
} from '../types/products-types'

/* -------------------- Type guards -------------------- */
const isProduct = (
  item: CardProduct | CardWorkshop | CardService
): item is CardProduct =>
  (item as CardProduct).price !== undefined &&
  (item as CardProduct).condition !== undefined
const isWorkshop = (
  item: CardProduct | CardWorkshop | CardService
): item is CardWorkshop => (item as CardWorkshop).address !== undefined
const isService = (
  item: CardProduct | CardWorkshop | CardService
): item is CardService =>
  (item as CardService).price !== undefined &&
  (item as CardService).serviceCategory !== undefined

/* -------------------- Product Card -------------------- */
const ProductCard = ({
  product,
  onFavoriteToggle,
  isFavorite = false,
  onOpenMenu,
}: {
  product: CardProduct
  onFavoriteToggle?: (id: string) => void
  isFavorite?: boolean
  onOpenMenu?: OnOpenMenuHandler
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const hasImages = product.images.length > 0
  const currentImage = hasImages ? product.images[0] : undefined
  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}€`

  const getConditionProps = (c: CardProduct['condition']) => {
    switch (c) {
      case 'new':
        return { color: 'success' as const, label: 'Nuevo' }
      case 'used':
        return { color: 'default' as const, label: 'Usado' }
      case 'refurb':
        return { color: 'warning' as const, label: 'Reacondicionado' }
      default:
        return { color: 'default' as const, label: c }
    }
  }
  const conditionProps = getConditionProps(product.condition)

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
          ? `0 12px 24px ${alpha(theme.palette.common.black, 0.2)}`
          : theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
      }}
    >
      {/* Botón ⋮ para el menú contextual */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation()
          onOpenMenu?.(e, product)
        }}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          bgcolor: 'rgba(255,255,255,0.95)',
          '&:hover': { bgcolor: 'white' },
        }}
      >
        <MoreVert />
      </IconButton>

      {/* Imagen */}
      <Box sx={{ position: 'relative', height: 260, bgcolor: 'grey.50' }}>
        {currentImage ? (
          <CardMedia
            component="img"
            image={currentImage.medium}
            alt={product.title}
            onLoad={() => setImageLoaded(true)}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease, transform 0.4s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
            }}
          >
            <Store sx={{ fontSize: 48, color: 'grey.400' }} />
          </Box>
        )}

        {/* Badges */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: 'absolute', top: 12, left: 12 }}
        >
          <Chip
            label={conditionProps.label}
            color={conditionProps.color}
            size="small"
          />
          {product.status === 'DRAFT' && (
            <Chip label="Borrador" size="small" color="warning" />
          )}
        </Stack>

        {/* Contador de imágenes */}
        {hasImages && product.images.length > 1 && (
          <Chip
            icon={<Visibility />}
            label={product.images.length}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              bgcolor: alpha(theme.palette.common.black, 0.7),
              color: 'white',
            }}
          />
        )}

        {/* Overlay acciones (favorito / ver / carrito) */}
        <Fade in={isHovered} timeout={250}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.6),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/product/${product.id}`)
              }}
            >
              <Visibility />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                onFavoriteToggle?.(product.id)
              }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                /* add-to-cart aquí si aplica */
              }}
            >
              <ShoppingCart />
            </IconButton>
          </Box>
        </Fade>
      </Box>

      {/* Contenido */}
      <CardContent>
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          {product.title}
        </Typography>
        <Typography
          variant="h5"
          color="primary"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          {formatPrice(product.price)}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Store sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {product.workshop.name}
          </Typography>
          {product.workshop.city && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {product.workshop.city}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

/* -------------------- Workshop Card -------------------- */
const WorkshopCard = ({
  workshop,
  onOpenMenu,
  onFavoriteToggle,
  isFavorite = false,
}: {
  workshop: CardWorkshop
  onOpenMenu?: OnOpenMenuHandler
  onFavoriteToggle?: (id: string) => void
  isFavorite?: boolean
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/workshop/${workshop.id}`)}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
        boxShadow: isHovered
          ? `0 12px 24px ${alpha(theme.palette.common.black, 0.2)}`
          : theme.shadows[1],
        position: 'relative',
      }}
    >
      {/* Botones de acción */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          display: 'flex',
          gap: 1,
        }}
      >
        {onFavoriteToggle && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onFavoriteToggle(workshop.id)
            }}
            sx={{
              bgcolor: 'rgba(255,255,255,0.95)',
              '&:hover': { bgcolor: 'white' },
            }}
          >
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
        )}
        {onOpenMenu && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onOpenMenu(e, workshop)
            }}
            sx={{
              bgcolor: 'rgba(255,255,255,0.95)',
              '&:hover': { bgcolor: 'white' },
            }}
          >
            <MoreVert />
          </IconButton>
        )}
      </Box>

      <Box
        sx={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: workshop.logoMedium ? 'grey.100' : alpha(theme.palette.primary.main, 0.8),
        }}
      >
        {workshop.logoMedium ? (
          <CardMedia
            component="img"
            image={workshop.logoMedium}
            alt={workshop.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              p: 2,
            }}
          />
        ) : (
          <Business sx={{ fontSize: 64, color: 'white' }} />
        )}
      </Box>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {workshop.name}
        </Typography>
        {workshop.description && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {workshop.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

/* -------------------- Service Card -------------------- */
const ServiceCard = ({ service }: { service: CardService }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}€`

  const getVehicleTypeLabel = (type: CardService['vehicleType']) => {
    switch (type) {
      case 'BICYCLE':
        return 'Bicicleta'
      case 'E_BIKE':
        return 'Bici eléctrica'
      case 'E_SCOOTER':
        return 'Patinete eléctrico'
      case 'ALL':
        return 'Todos'
      default:
        return type
    }
  }

  const getVehicleTypeColor = (type: CardService['vehicleType']) => {
    switch (type) {
      case 'BICYCLE':
        return 'success'
      case 'E_BIKE':
        return 'info'
      case 'E_SCOOTER':
        return 'warning'
      case 'ALL':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/workshop/${service.workshop.id}`)}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
        boxShadow: isHovered
          ? `0 12px 24px ${alpha(theme.palette.common.black, 0.2)}`
          : theme.shadows[1],
        position: 'relative',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Icono del servicio */}
      <Box
        sx={{
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.info.main, 0.1),
          position: 'relative',
        }}
      >
        <Build sx={{ fontSize: 56, color: theme.palette.info.main }} />
      </Box>

      <CardContent>
        {/* Categoría del servicio */}
        <Chip
          label={service.serviceCategory.name}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1 }}
        />

        {/* Nombre del servicio */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {service.name}
        </Typography>

        {/* Descripción */}
        {service.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {service.description}
          </Typography>
        )}

        {/* Info adicional */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          {/* Taller */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Store sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {service.workshop.name}
            </Typography>
          </Box>

          {/* Duración */}
          {service.duration && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {service.duration} min
              </Typography>
            </Box>
          )}

          {/* Tipo de vehículo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TwoWheeler sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Chip
              label={getVehicleTypeLabel(service.vehicleType)}
              size="small"
              color={getVehicleTypeColor(service.vehicleType) as any}
              variant="outlined"
            />
          </Box>
        </Stack>

        {/* Precio */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {formatPrice(service.price)}
          </Typography>
          <Chip label="Ver detalles" size="small" color="primary" />
        </Box>
      </CardContent>
    </Card>
  )
}

/* -------------------- Layout -------------------- */
export const ModernLayout = ({
  items,
  loading = false,
  error,
  emptyMessage = 'No hay elementos disponibles',
  onFavoriteToggle,
  favoriteIds = [],
  type,
  onOpenMenu,
}: {
  items: (CardProduct | CardWorkshop | CardService)[]
  type: 'product' | 'workshop' | 'service'
  onOpenMenu?: OnOpenMenuHandler
} & ModernLayoutCommonProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const columns = isMobile ? 1 : isTablet ? 2 : 3

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 3,
            py: 4,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton
                variant="rectangular"
                height={type === 'product' ? 260 : 200}
              />
              <CardContent>
                <Skeleton height={32} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!items || items.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" py={10}>
          <Typography variant="h5">{emptyMessage}</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 3,
          py: 4,
        }}
      >
        {items.map((item) =>
          type === 'product' && isProduct(item) ? (
            <ProductCard
              key={item.id}
              product={item}
              onFavoriteToggle={onFavoriteToggle}
              isFavorite={favoriteIds.includes(item.id)}
              onOpenMenu={onOpenMenu}
            />
          ) : type === 'workshop' && isWorkshop(item) ? (
            <WorkshopCard
              key={item.id}
              workshop={item}
              onOpenMenu={onOpenMenu}
              onFavoriteToggle={onFavoriteToggle}
              isFavorite={favoriteIds.includes(item.id)}
            />
          ) : type === 'service' && isService(item) ? (
            <ServiceCard key={item.id} service={item} />
          ) : null
        )}
      </Box>
    </Container>
  )
}

/* -------------------- Shortcuts -------------------- */
export const ModernProductLayout = (
  props: {
    products: CardProduct[]
  } & ModernLayoutCommonProps & { onOpenMenu?: OnOpenMenuHandler }
) => <ModernLayout {...props} items={props.products} type="product" />

export const ModernWorkshopLayout = (
  props: {
    workshops: CardWorkshop[]
  } & ModernLayoutCommonProps & { onOpenMenu?: OnOpenMenuHandler }
) => <ModernLayout {...props} items={props.workshops} type="workshop" />

export const ModernServiceLayout = (
  props: {
    services: CardService[]
  } & ModernLayoutCommonProps
) => <ModernLayout {...props} items={props.services} type="service" />
