import nodemailer from 'nodemailer'

const { MAILTRAP_USER, MAILTRAP_PASS } = process.env

// Usar la misma configuración de Mailtrap que ya tienes
const transporter = MAILTRAP_USER && MAILTRAP_PASS
  ? nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: MAILTRAP_USER,
        pass: MAILTRAP_PASS,
      },
    })
  : null

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
    if (!transporter) {
      console.warn('⚠️  [EMAIL] Mailtrap no configurado. Email no enviado.')
      console.log(`📧 [EMAIL] Se hubiera enviado email a ${data.workshopOwnerEmail}:`, data)
      return
    }

    await transporter.sendMail({
      from: 'no-reply@rodamallorca.com',
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
  } catch (error) {
    console.error('❌ [EMAIL] Error enviando email:', error)
    // No lanzar error para no bloquear la creación del pedido
  }
}
