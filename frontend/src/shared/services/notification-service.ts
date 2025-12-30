// Servicio global de notificaciones - puede usarse en cualquier parte
type NotificationSeverity = 'success' | 'error' | 'warning' | 'info'

type NotificationCallback = (message: string, severity: NotificationSeverity, duration?: number) => void

class NotificationService {
  private callback: NotificationCallback | null = null

  // El provider registra su función de mostrar notificaciones
  register(callback: NotificationCallback) {
    this.callback = callback
  }

  // El provider se desregistra al desmontarse
  unregister() {
    this.callback = null
  }

  // Métodos públicos que pueden ser llamados desde cualquier parte
  success(message: string, duration = 4000) {
    this.callback?.(message, 'success', duration)
  }

  error(message: string, duration = 6000) {
    this.callback?.(message, 'error', duration)
  }

  warning(message: string, duration = 5000) {
    this.callback?.(message, 'warning', duration)
  }

  info(message: string, duration = 4000) {
    this.callback?.(message, 'info', duration)
  }

  // Alias para compatibilidad
  show(message: string, severity: NotificationSeverity = 'info', duration = 4000) {
    this.callback?.(message, severity, duration)
  }
}

// Exportar instancia única (singleton)
export const notify = new NotificationService()
