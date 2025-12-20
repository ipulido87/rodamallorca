import { Card, CardContent, Skeleton, Box, Stack } from '@mui/material'

export const WorkshopSkeleton = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Icono y título */}
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        </Stack>

        {/* Descripción */}
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />

        {/* Ubicación */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width="50%" />
        </Box>

        {/* Botón */}
        <Skeleton variant="rounded" height={36} sx={{ mt: 3 }} />
      </CardContent>
    </Card>
  )
}

export const WorkshopSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <WorkshopSkeleton key={index} />
      ))}
    </Box>
  )
}
