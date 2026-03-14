import { InfoPage } from './info-page'

export const HelpCenterPage = () => {
  return (
    <InfoPage
      title="Centro de Ayuda"
      description="Resolvemos tus dudas sobre reservas, pagos, devoluciones y funcionamiento general de RodaMallorca."
      canonicalPath="/centro-de-ayuda"
      sections={[
        {
          heading: 'Reservas y alquileres',
          content:
            'Puedes revisar disponibilidad, confirmar alquiler y gestionar cancelaciones desde tu cuenta. Si el establecimiento ofrece cambios, podrás solicitarlos desde el detalle de pedido.',
        },
        {
          heading: 'Pagos y facturación',
          content:
            'La plataforma procesa pagos de forma segura. En cada pedido verás el estado de pago y, cuando aplique, la factura correspondiente.',
        },
        {
          heading: 'Soporte',
          content:
            'Si necesitas ayuda adicional, escríbenos a info@rodamallorca.com y te responderemos con la mayor brevedad.',
        },
      ]}
    />
  )
}
