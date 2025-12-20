import webpush from 'web-push'

/**
 * Script para generar claves VAPID para Web Push Notifications
 * Ejecutar con: npx tsx src/scripts/generate-vapid-keys.ts
 */

console.log('🔑 Generando claves VAPID para Web Push...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ Claves VAPID generadas exitosamente!\n')
console.log('📋 Agrega estas variables a tu archivo .env:\n')
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log(`VAPID_SUBJECT=mailto:tu-email@ejemplo.com\n`)

console.log('💡 Importante:')
console.log('- Guarda estas claves de forma segura')
console.log('- No compartas la clave privada')
console.log('- Cambia el email en VAPID_SUBJECT por tu email real')
console.log('- La clave pública se usará en el frontend\n')
