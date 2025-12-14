import { Card, CardContent, Skeleton, Box } from '@mui/material'

export const ProductSkeleton = () => {
  return (
    <Card sx={{ height: '100%' }}>
      {/* Imagen */}
      <Skeleton variant="rectangular" height={200} />

      <CardContent>
        {/* Título */}
        <Skeleton variant="text" width="80%" height={32} />

        {/* Precio */}
        <Skeleton variant="text" width="40%" height={28} sx={{ mt: 1 }} />

        {/* Workshop info */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width="60%" />
        </Box>

        {/* Botón */}
        <Skeleton variant="rounded" height={36} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  )
}

export const ProductSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </Box>
  )
}
