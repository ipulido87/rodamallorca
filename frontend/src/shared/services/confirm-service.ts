// Servicio global de confirmaciones - puede usarse en cualquier parte
import i18n from '../../i18n/i18n'

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
  async delete(itemName: string = i18n.t('confirm.deleteDefault')): Promise<boolean> {
    return this.ask({
      title: i18n.t('confirm.deleteTitle'),
      message: i18n.t('confirm.deleteMessage', { item: itemName }),
      confirmText: i18n.t('common.delete'),
      cancelText: i18n.t('common.cancel'),
      severity: 'error',
    })
  }

  // Confirmación de descarte de cambios
  async discardChanges(): Promise<boolean> {
    return this.ask({
      title: i18n.t('confirm.discardTitle'),
      message: i18n.t('confirm.discardMessage'),
      confirmText: i18n.t('common.discard'),
      cancelText: i18n.t('common.continueEditing'),
      severity: 'warning',
    })
  }

  // Confirmación genérica de acción
  async action(message: string, title: string = i18n.t('confirm.confirmTitle')): Promise<boolean> {
    return this.ask({
      title,
      message,
      confirmText: i18n.t('common.confirm'),
      cancelText: i18n.t('common.cancel'),
      severity: 'info',
    })
  }
}

// Exportar instancia única (singleton)
export const confirmDialog = new ConfirmService()
