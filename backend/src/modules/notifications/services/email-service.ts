import { Resend } from 'resend'
import { generateInvoicePDF } from '../../billing/services/invoice-pdf-generator'

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
  workshopAddress?: string
  workshopCity?: string
  workshopTaxId?: string
  workshopPhone?: string
  orderNumber: string
  invoiceNumber: string
  issueDate: string
  totalAmount: string
  subtotal: number
  taxAmount: number
  total: number
  itemsCount: number
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
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

    // 📄 Generar PDF de la factura
    console.log('📄 [PDF] Generando PDF de factura...')
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      workshopName: data.workshopName,
      workshopAddress: data.workshopAddress,
      workshopCity: data.workshopCity,
      workshopTaxId: data.workshopTaxId,
      workshopPhone: data.workshopPhone,
      items: data.items,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      total: data.total,
    })
    console.log('✅ [PDF] PDF generado correctamente')

    await resend.emails.send({
      from: emailFrom,
      to: data.customerEmail,
      subject: `✅ Pedido Confirmado #${data.orderNumber} - Factura #${data.invoiceNumber}`,
      attachments: [
        {
          filename: `Factura_${data.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
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

interface TrialStartedEmailData {
  workshopName: string
  ownerEmail: string
  trialEndDate: string
  dashboardUrl: string
}

/**
 * Envía email cuando inicia el período de prueba de 7 días
 */
export const sendTrialStartedEmail = async (data: TrialStartedEmailData): Promise<void> => {
  try {
    if (!resend) {
      console.warn('⚠️  [EMAIL] Resend no configurado. Email de trial iniciado no enviado.')
      console.log(`📧 [EMAIL] Se hubiera enviado email de trial a ${data.ownerEmail}`)
      return
    }

    const emailFrom = EMAIL_FROM || 'RodaMallorca <noreply@rodamallorca.es>'

    await resend.emails.send({
      from: emailFrom,
      to: data.ownerEmail,
      subject: `🎉 ¡Bienvenido a RodaMallorca Premium! - Prueba de 7 días activada`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Período de Prueba Activado</title>
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
              background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
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
            .trial-badge {
              display: inline-block;
              background: #ffd700;
              color: #333;
              padding: 10px 20px;
              border-radius: 25px;
              font-size: 16px;
              font-weight: bold;
              margin: 20px 0;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .benefits {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .benefit-item {
              padding: 12px 0;
              border-bottom: 1px solid #f0f0f0;
              display: flex;
              align-items: center;
            }
            .benefit-item:last-child {
              border-bottom: none;
            }
            .benefit-icon {
              font-size: 24px;
              margin-right: 15px;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #9c27b0;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              text-align: center;
              margin: 20px auto;
              display: block;
              width: fit-content;
            }
            .info-box {
              background: #fff3e0;
              border-left: 4px solid #ff9800;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
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
              font-size: 48px;
              text-align: center;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎉</div>
              <h1>¡Tu Prueba Premium ha Comenzado!</h1>
            </div>

            <p>Hola <strong>${data.workshopName}</strong>,</p>
            <p>¡Bienvenido a RodaMallorca Premium! Tu período de prueba de 7 días ya está activo.</p>

            <div style="text-align: center;">
              <div class="trial-badge">
                ✨ 7 Días de Prueba GRATIS ✨
              </div>
            </div>

            <div class="benefits">
              <h3 style="margin-top: 0; color: #9c27b0;">Ahora tienes acceso a:</h3>

              <div class="benefit-item">
                <span class="benefit-icon">📦</span>
                <span><strong>Gestión de Pedidos:</strong> Recibe y procesa pedidos de clientes</span>
              </div>

              <div class="benefit-item">
                <span class="benefit-icon">🧾</span>
                <span><strong>Facturación Automática:</strong> Genera facturas profesionales al instante</span>
              </div>

              <div class="benefit-item">
                <span class="benefit-icon">📊</span>
                <span><strong>Estadísticas Avanzadas:</strong> Analiza el rendimiento de tu taller</span>
              </div>

              <div class="benefit-item">
                <span class="benefit-icon">⭐</span>
                <span><strong>Perfil Destacado:</strong> Mayor visibilidad en el marketplace</span>
              </div>

              <div class="benefit-item">
                <span class="benefit-icon">🔔</span>
                <span><strong>Notificaciones en Tiempo Real:</strong> Entérate de nuevos pedidos al instante</span>
              </div>
            </div>

            <a href="${data.dashboardUrl}" class="button">
              🚀 Ir al Dashboard
            </a>

            <div class="info-box">
              <p style="margin: 0; color: #e65100;">
                <strong>📅 Tu prueba termina el ${data.trialEndDate}</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                Tres días antes te enviaremos un recordatorio. Si decides continuar, se procesará el primer pago automáticamente.
                Puedes cancelar en cualquier momento desde tu panel de control.
              </p>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              💡 <strong>Consejo:</strong> Aprovecha estos 7 días para explorar todas las funcionalidades y configurar tu taller completamente.
            </p>

            <div class="footer">
              <p>Si tienes alguna pregunta, estamos aquí para ayudarte.</p>
              <p>© ${new Date().getFullYear()} RodaMallorca. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log(`✅ [EMAIL] Email de trial iniciado enviado a ${data.ownerEmail}`)
  } catch (error: any) {
    console.error('❌ [EMAIL] Error enviando email de trial:', error?.message || error)
  }
}

interface TrialEndingEmailData {
  workshopName: string
  ownerEmail: string
  trialEndDate: string
  amount: string
  manageSubscriptionUrl: string
}

/**
 * Envía email 3 días antes de que termine el trial y se realice el primer cobro
 */
export const sendTrialEndingEmail = async (data: TrialEndingEmailData): Promise<void> => {
  try {
    if (!resend) {
      console.warn('⚠️  [EMAIL] Resend no configurado. Email de trial finalizando no enviado.')
      console.log(`📧 [EMAIL] Se hubiera enviado email de trial ending a ${data.ownerEmail}`)
      return
    }

    const emailFrom = EMAIL_FROM || 'RodaMallorca <noreply@rodamallorca.es>'

    await resend.emails.send({
      from: emailFrom,
      to: data.ownerEmail,
      subject: `⏰ Tu prueba termina en 3 días - RodaMallorca Premium`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tu Prueba Está por Terminar</title>
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
              background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
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
            .countdown-box {
              background: white;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              border: 3px solid #ff9800;
            }
            .countdown-number {
              font-size: 48px;
              font-weight: bold;
              color: #ff9800;
              margin: 10px 0;
            }
            .price-box {
              background: #fff3e0;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .price {
              font-size: 32px;
              font-weight: bold;
              color: #ff9800;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #ff9800;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              text-align: center;
              margin: 10px;
            }
            .button-secondary {
              background-color: #666;
            }
            .info-box {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Tu Prueba Está por Terminar</h1>
            </div>

            <p>Hola <strong>${data.workshopName}</strong>,</p>
            <p>Tu período de prueba gratuito de RodaMallorca Premium está llegando a su fin.</p>

            <div class="countdown-box">
              <div style="font-size: 18px; color: #666;">Tiempo restante de prueba</div>
              <div class="countdown-number">3 DÍAS</div>
              <div style="font-size: 14px; color: #999;">Finaliza el ${data.trialEndDate}</div>
            </div>

            <p style="text-align: center; font-size: 18px; color: #333;">
              <strong>El ${data.trialEndDate}</strong> se procesará automáticamente el primer pago de tu suscripción Premium.
            </p>

            <div class="price-box">
              <div style="color: #666; margin-bottom: 10px;">Importe del primer cobro:</div>
              <div class="price">${data.amount}</div>
              <div style="color: #999; font-size: 14px; margin-top: 10px;">Facturación mensual</div>
            </div>

            <div class="info-box">
              <p style="margin: 0;">
                <strong>💳 ¿Qué pasará después del trial?</strong>
              </p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Se cargará ${data.amount} a tu método de pago registrado</li>
                <li>Mantendrás acceso completo a todas las funcionalidades Premium</li>
                <li>Se renovará automáticamente cada mes</li>
                <li>Podrás cancelar en cualquier momento sin penalización</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; margin-bottom: 15px;">
                <strong>¿Todo listo para continuar?</strong>
              </p>
              <a href="${data.manageSubscriptionUrl}" class="button">
                ✅ Continuar con Premium
              </a>
              <br>
              <a href="${data.manageSubscriptionUrl}" class="button button-secondary">
                ❌ Cancelar Suscripción
              </a>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
              Si no haces nada, tu suscripción continuará automáticamente.<br>
              Puedes cancelar desde tu panel de control en cualquier momento.
            </p>

            <div class="footer">
              <p>¿Preguntas? Estamos aquí para ayudarte.</p>
              <p>© ${new Date().getFullYear()} RodaMallorca. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log(`✅ [EMAIL] Email de trial ending enviado a ${data.ownerEmail}`)
  } catch (error: any) {
    console.error('❌ [EMAIL] Error enviando email de trial ending:', error?.message || error)
  }
}

interface PaymentSuccessEmailData {
  workshopName: string
  ownerEmail: string
  amount: string
  nextBillingDate: string
  invoiceUrl: string
  manageSubscriptionUrl: string
}

/**
 * Envía email cuando se procesa un pago exitoso
 */
export const sendPaymentSuccessEmail = async (data: PaymentSuccessEmailData): Promise<void> => {
  try {
    if (!resend) {
      console.warn('⚠️  [EMAIL] Resend no configurado. Email de pago exitoso no enviado.')
      console.log(`📧 [EMAIL] Se hubiera enviado email de pago a ${data.ownerEmail}`)
      return
    }

    const emailFrom = EMAIL_FROM || 'RodaMallorca <noreply@rodamallorca.es>'

    await resend.emails.send({
      from: emailFrom,
      to: data.ownerEmail,
      subject: `✅ Pago Confirmado - RodaMallorca Premium`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Confirmado</title>
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
            .success-icon {
              font-size: 64px;
              text-align: center;
              margin: 20px 0;
            }
            .payment-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #4caf50;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .amount {
              font-size: 32px;
              font-weight: bold;
              color: #4caf50;
              text-align: center;
              margin: 20px 0;
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
              margin: 10px;
            }
            .button-secondary {
              background-color: #2196f3;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Pago Procesado Exitosamente</h1>
            </div>

            <div class="success-icon">✅</div>

            <p>Hola <strong>${data.workshopName}</strong>,</p>
            <p>Tu pago ha sido procesado correctamente. ¡Gracias por confiar en RodaMallorca Premium!</p>

            <div class="amount">${data.amount}</div>

            <div class="payment-details">
              <h3 style="margin-top: 0; color: #4caf50;">Detalles del Pago</h3>

              <div class="detail-row">
                <span style="color: #666;">Estado:</span>
                <span style="color: #4caf50; font-weight: bold;">✅ Pagado</span>
              </div>

              <div class="detail-row">
                <span style="color: #666;">Concepto:</span>
                <span>RodaMallorca Premium - Suscripción Mensual</span>
              </div>

              <div class="detail-row">
                <span style="color: #666;">Fecha de pago:</span>
                <span>${new Date().toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              <div class="detail-row">
                <span style="color: #666;">Próximo cobro:</span>
                <span>${data.nextBillingDate}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.invoiceUrl}" class="button">
                📄 Ver Recibo
              </a>
              <a href="${data.manageSubscriptionUrl}" class="button button-secondary">
                ⚙️ Gestionar Suscripción
              </a>
            </div>

            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; text-align: center;">
                <strong>🎉 ¡Sigues disfrutando de todas las ventajas Premium!</strong>
              </p>
              <p style="margin: 10px 0 0 0; text-align: center; color: #666; font-size: 14px;">
                Gestión de pedidos • Facturación automática • Estadísticas avanzadas • Soporte prioritario
              </p>
            </div>

            <div class="footer">
              <p>Gracias por tu confianza en RodaMallorca.</p>
              <p>© ${new Date().getFullYear()} RodaMallorca. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log(`✅ [EMAIL] Email de pago exitoso enviado a ${data.ownerEmail}`)
  } catch (error: any) {
    console.error('❌ [EMAIL] Error enviando email de pago:', error?.message || error)
  }
}
