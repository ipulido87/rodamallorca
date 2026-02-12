import { InfoPage } from './info-page'

export const RoutesPage = () => {
  return (
    <InfoPage
      title="Rutas Recomendadas"
      description="Descubre rutas de ciclismo recomendadas en Mallorca para distintos niveles y estilos de pedaleo."
      canonicalPath="/rutas-recomendadas"
      sections={[
        {
          heading: 'Ruta costera para principiantes',
          content:
            'Un recorrido suave con vistas al mar, ideal para disfrutar de la isla con paradas frecuentes y ritmo relajado.',
        },
        {
          heading: 'Ruta de interior de nivel medio',
          content:
            'Tramo mixto para quienes quieren combinar paisaje rural, desnivel moderado y carreteras secundarias.',
        },
        {
          heading: 'Ruta de montaña para expertos',
          content:
            'Ascensos exigentes y descensos técnicos para ciclistas con experiencia, con recomendaciones de equipamiento y revisión previa en taller.',
        },
      ]}
    />
  )
}
