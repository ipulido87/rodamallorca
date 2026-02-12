import { InfoPage } from './info-page'

export const PrivacyPage = () => {
  return (
    <InfoPage
      title="Política de Privacidad"
      description="Conoce cómo recopilamos y protegemos tus datos personales cuando utilizas RodaMallorca."
      canonicalPath="/politica-de-privacidad"
      sections={[
        {
          heading: 'Datos que recopilamos',
          content:
            'Recopilamos datos básicos de cuenta, información de contacto y actividad dentro de la plataforma para prestar y mejorar el servicio.',
        },
        {
          heading: 'Finalidad del tratamiento',
          content:
            'Utilizamos tus datos para gestionar reservas, pagos, comunicación de soporte y mejora de experiencia de usuario.',
        },
        {
          heading: 'Tus derechos',
          content:
            'Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a info@rodamallorca.com.',
        },
      ]}
    />
  )
}
