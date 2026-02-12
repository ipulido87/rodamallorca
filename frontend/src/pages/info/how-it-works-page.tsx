import { InfoPage } from './info-page'

export const HowItWorksPage = () => {
  return (
    <InfoPage
      title="Cómo Funciona"
      description="Publica, alquila o encuentra servicios de taller en tres pasos sencillos dentro de RodaMallorca."
      canonicalPath="/como-funciona"
      sections={[
        {
          heading: '1. Encuentra lo que necesitas',
          content:
            'Busca por tipo de bicicleta, producto o taller y filtra por ubicación, categoría o disponibilidad para ver opciones relevantes en Mallorca.',
        },
        {
          heading: '2. Reserva o contacta',
          content:
            'Realiza tu reserva de alquiler o compra tus productos favoritos. Si necesitas reparación o mantenimiento, contacta con el taller desde la plataforma.',
        },
        {
          heading: '3. Disfruta y valora',
          content:
            'Después del servicio, comparte tu experiencia. Las reseñas ayudan a mejorar la calidad y a que otros usuarios encuentren mejores opciones.',
        },
      ]}
    />
  )
}
