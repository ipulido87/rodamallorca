import { Box } from '@mui/material'
import { RoutesSection } from '../../shared/components/RoutesSection'
import { Seo } from '../../shared/components/Seo'

export const RutasPage = () => (
  <>
    <Seo
      title="Rutas de Ciclismo en Mallorca | RodaMallorca"
      description="Descubre las mejores rutas ciclistas de Mallorca: Sa Calobra, Cap de Formentor, Serra de Tramuntana y más. Mapa interactivo, distancias y desniveles."
      canonicalPath="/rutas"
      keywords="rutas ciclismo Mallorca, ruta bicicleta Mallorca, Sa Calobra bici, Formentor ciclismo, Serra de Tramuntana ruta"
    />
    <Box sx={{ background: '#0d1b2a', minHeight: '100vh' }}>
      <RoutesSection />
    </Box>
  </>
)
