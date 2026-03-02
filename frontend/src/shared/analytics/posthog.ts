import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com'

export function initPosthog() {
  if (!POSTHOG_KEY) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Cookieless — sin banner de cookies adicional
    persistence: 'memory',
    // No capturar clicks automáticos (evita ruido, tracking manual)
    autocapture: false,
    // No grabar sesiones por defecto (activar cuando haya plan de pago)
    disable_session_recording: true,
    // Cargar en segundo plano sin bloquear render
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.opt_out_capturing()
      }
    },
  })
}

export { posthog }
