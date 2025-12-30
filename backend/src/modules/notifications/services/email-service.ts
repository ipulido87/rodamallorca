import { Resend } from 'resend'

const { RESEND_API_KEY, EMAIL_FROM } = process.env

// Usar Resend para enviar emails en producción
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

interface NewOrderEmailData {
  workshopName: string
  workshopOwnerEmail: string
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: string
  itemsCount: number
  orderUrl: string
}

/**
 * Envía email al taller cuando recibe un nuevo pedido
 */
export const sendNewOrderEmail = async (data: NewOrderEmailData): Promise<void> => {
  try {
    // Si no hay configuración de email, solo logear (no bloquear la app)
    if (!resend) {
      console.warn('⚠️  [EMAIL] Resend no configurado (falta RESEND_API_KEY). Email no enviado.')
      console.log(`📧 [EMAIL] Se hubiera enviado email a ${data.workshopOwnerEmail}:`, data)
      return
    }

    const emailFrom = EMAIL_FROM || 'RodaMallorca <noreply@rodamallorca.es>'

    await resend.emails.send({
      from: emailFrom,
      to: data.workshopOwnerEmail,
      subject: `🔔 Nuevo Pedido #${data.orderNumber} - ${data.workshopName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo Pedido</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .header {
              background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
              margin: -30px -30px 20px -30px;
            }
            h1 {
              margin: 0;
              font-size: 24px;
            }
            .order-info {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #1976d2;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .info-value {
              color: #333;
            }
            .total {
              font-size: 24px;
              font-weight: bold;
              color: #1976d2;
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              background: #e3f2fd;
              border-radius: 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #1976d2;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              text-align: center;
              margin: 20px auto;
              display: block;
              width: fit-content;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 14px;
            }
            .emoji {
              font-size: 32px;
              text-align: center;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🛒</div>
              <h1>¡Nuevo Pedido Recibido!</h1>
            </div>

            <p>Hola <strong>${data.workshopName}</strong>,</p>
            <p>Has recibido un nuevo pedido de <strong>${data.customerName}</strong>.</p>

            <div class="order-info">
              <div class="info-row">
                <span class="info-label">Número de Pedido:</span>
                <span class="info-value">#${data.orderNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cliente:</span>
                <span class="info-value">${data.customerName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${data.customerEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Productos:</span>
                <span class="info-value">${data.itemsCount} ${data.itemsCount === 1 ? 'artículo' : 'artículos'}</span>
              </div>
            </div>

            <div class="total">
              Total: ${data.totalAmount}
            </div>

            <a href="${data.orderUrl}" class="button">
              Ver Detalles del Pedido
            </a>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              💡 <strong>Tip:</strong> Recuerda confirmar el pedido para que se genere automáticamente la factura.
            </p>

            <div class="footer">
              <p>Este email fue enviado automáticamente por el sistema de notificaciones.</p>
              <p>© ${new Date().getFullYear()} RodaMallorca. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log(`✅ [EMAIL] Email enviado a ${data.workshopOwnerEmail} - Pedido #${data.orderNumber}`)
  } catch (error: any) {
    console.error('❌ [EMAIL] Error enviando email:', error?.message || error)
    // No lanzar error para no bloquear la creación del pedido
  }
}

interface InvoiceEmailData {
  customerName: string
  customerEmail: string
  workshopName: string
  orderNumber: string
  invoiceNumber: string
  totalAmount: string
  itemsCount: number
  invoiceUrl: string
}

/**
 * Envía email al cliente cuando su pedido es aceptado y se genera la factura
 */
export const sendInvoiceEmail = async (data: InvoiceEmailData): Promise<void> => {
  try {
    if (!resend) {
      console.warn('⚠️  [EMAIL] Resend no configurado. Email de factura no enviado.')
      console.log(`📧 [EMAIL] Se hubiera enviado factura a ${data.customerEmail}:`, data)
      return
    }

    const emailFrom = EMAIL_FROM || 'RodaMallorca <noreply@rodamallorca.es>'

    await resend.emails.send({
      from: emailFrom,
      to: data.customerEmail,
      subject: `✅ Pedido Confirmado #${data.orderNumber} - Factura #${data.invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pedido Confirmado</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .header {
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
              margin: -30px -30px 20px -30px;
            }
            h1 {
              margin: 0;
              font-size: 24px;
            }
            .order-info {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #4caf50;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .info-value {
              color: #333;
            }
            .total {
              font-size: 24px;
              font-weight: bold;
              color: #4caf50;
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              background: #e8f5e9;
              border-radius: 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4caf50;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              text-align: center;
              margin: 20px auto;
              display: block;
              width: fit-content;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 14px;
            }
            .emoji {
              font-size: 32px;
              text-align: center;
              margin: 10px 0;
            }
            .success-badge {
              display: inline-block;
              background: #4caf50;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">✅</div>
              <h1>¡Pedido Confirmado!</h1>
            </div>

            <p>Hola <strong>${data.customerName}</strong>,</p>
            <p>¡Buenas noticias! <strong>${data.workshopName}</strong> ha confirmado tu pedido.</p>

            <div style="text-align: center; margin: 20px 0;">
              <span class="success-badge">🎉 TU PEDIDO HA SIDO ACEPTADO</span>
            </div>

            <div class="order-info">
              <div class="info-row">
                <span class="info-label">Número de Pedido:</span>
                <span class="info-value">#${data.orderNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Número de Factura:</span>
                <span class="info-value">#${data.invoiceNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Taller:</span>
                <span class="info-value">${data.workshopName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Productos:</span>
                <span class="info-value">${data.itemsCount} ${data.itemsCount === 1 ? 'artículo' : 'artículos'}</span>
              </div>
            </div>

            <div class="total">
              Total: ${data.totalAmount}
            </div>

            <a href="${data.invoiceUrl}" class="button">
              Ver Factura
            </a>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              📋 <strong>Próximos pasos:</strong>
            </p>
            <ul style="color: #666; font-size: 14px;">
              <li>El taller comenzará a procesar tu pedido</li>
              <li>Recibirás actualizaciones sobre el estado de tu pedido</li>
              <li>Puedes ver tu factura haciendo clic en el botón de arriba</li>
            </ul>

            <div class="footer">
              <p>Si tienes alguna pregunta, contacta directamente con <strong>${data.workshopName}</strong>.</p>
              <p>© ${new Date().getFullYear()} RodaMallorca. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log(`✅ [EMAIL] Factura enviada a ${data.customerEmail} - Pedido #${data.orderNumber}`)
  } catch (error: any) {
    console.error('❌ [EMAIL] Error enviando factura:', error?.message || error)
    // No lanzar error para no bloquear la generación de la factura
  }
}
