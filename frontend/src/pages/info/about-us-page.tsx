import { InfoPage } from './info-page'

export const AboutUsPage = () => {
  return (
    <InfoPage
      title="Sobre Nosotros"
      description="Conectamos ciclistas y talleres en Mallorca para facilitar alquiler, reparación y compra de equipamiento en un solo lugar."
      canonicalPath="/sobre-nosotros"
      sections={[
        {
          heading: 'Nuestra misión',
          content:
            'Queremos que moverte en bici por Mallorca sea más fácil, seguro y sostenible. Reunimos a la comunidad ciclista y a los talleres locales en una plataforma clara y rápida.',
        },
        {
          heading: 'Qué hacemos',
          content:
            'En RodaMallorca puedes descubrir bicicletas en alquiler, productos de ciclismo y talleres especializados. También impulsamos el comercio local para que ciclistas y profesionales crezcan juntos.',
        },
        {
          heading: 'Compromiso local',
          content:
            'Trabajamos con negocios de proximidad y servicios adaptados al territorio, priorizando la calidad de la atención y la experiencia real de los usuarios en la isla.',
        },
      ]}
    />
  )
}
