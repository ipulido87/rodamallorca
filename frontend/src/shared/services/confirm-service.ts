// Servicio global de confirmaciones - puede usarse en cualquier parte
interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  severity?: 'error' | 'warning' | 'info'
}

type ConfirmCallback = (options: ConfirmOptions) => Promise<boolean>

class ConfirmService {
  private callback: ConfirmCallback | null = null

  // El provider registra su función
  register(callback: ConfirmCallback) {
    this.callback = callback
  }

  // El provider se desregistra al desmontarse
  unregister() {
    this.callback = null
  }

  // Confirmación genérica
  async ask(options: ConfirmOptions): Promise<boolean> {
    if (!this.callback) {
      // Fallback al confirm nativo si el provider no está montado
      return window.confirm(options.message)
    }
    return this.callback(options)
  }

  // Confirmación de eliminación (atajos comunes)
  async delete(itemName: string = 'este elemento'): Promise<boolean> {
    return this.ask({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar ${itemName}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      severity: 'error',
    })
  }

  // Confirmación de descarte de cambios
  async discardChanges(): Promise<boolean> {
    return this.ask({
      title: 'Descartar cambios',
      message: '¿Estás seguro de descartar los cambios? Los cambios no guardados se perderán.',
      confirmText: 'Descartar',
      cancelText: 'Continuar editando',
      severity: 'warning',
    })
  }

  // Confirmación genérica de acción
  async action(message: string, title: string = 'Confirmar'): Promise<boolean> {
    return this.ask({
      title,
      message,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      severity: 'info',
    })
  }
}

// Exportar instancia única (singleton)
export const confirmDialog = new ConfirmService()
