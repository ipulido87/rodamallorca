import { InfoPage } from './info-page'

export const TermsPage = () => {
  return (
    <InfoPage
      title="Términos de Servicio"
      description="Consulta las condiciones de uso de la plataforma RodaMallorca para usuarios y negocios colaboradores."
      canonicalPath="/terminos-de-servicio"
      sections={[
        {
          heading: 'Uso de la plataforma',
          content:
            'Al utilizar RodaMallorca aceptas usar el servicio de forma legal, responsable y respetuosa con otros usuarios y colaboradores.',
        },
        {
          heading: 'Reservas, compras y cancelaciones',
          content:
            'Cada taller o tienda puede tener políticas específicas de cancelación, cambios y devoluciones que se mostrarán antes de confirmar.',
        },
        {
          heading: 'Responsabilidades',
          content:
            'RodaMallorca actúa como plataforma de conexión entre usuarios y negocios. Cada proveedor es responsable de la calidad de su servicio y la información publicada.',
        },
      ]}
    />
  )
}
