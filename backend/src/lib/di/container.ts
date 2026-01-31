/**
 * Contenedor de Inyección de Dependencias (IoC Container)
 *
 * Implementación simple de un contenedor de inversión de control
 * que permite registrar y resolver dependencias de forma centralizada.
 *
 * Beneficios:
 * - Desacopla la creación de objetos de su uso
 * - Facilita el testing (se pueden inyectar mocks)
 * - Centraliza la configuración de dependencias
 * - Soporta singletons para evitar múltiples instancias
 */

type Factory<T> = () => T

class DIContainer {
  private singletons = new Map<string, unknown>()
  private factories = new Map<string, Factory<unknown>>()

  /**
   * Registra una dependencia como singleton.
   * La factory se ejecutará solo una vez, la primera vez que se solicite.
   */
  registerSingleton<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory as Factory<unknown>)
  }

  /**
   * Registra una dependencia como transient (nueva instancia cada vez).
   */
  registerTransient<T>(key: string, factory: Factory<T>): void {
    // Para transients, guardamos la factory con un prefijo especial
    this.factories.set(`__transient__${key}`, factory as Factory<unknown>)
  }

  /**
   * Obtiene una dependencia del contenedor.
   * Si es singleton y ya fue creada, retorna la instancia existente.
   * Si es transient, crea una nueva instancia cada vez.
   */
  get<T>(key: string): T {
    // Primero verificar si es transient
    const transientFactory = this.factories.get(`__transient__${key}`)
    if (transientFactory) {
      return transientFactory() as T
    }

    // Si es singleton
    if (!this.singletons.has(key)) {
      const factory = this.factories.get(key)
      if (!factory) {
        throw new Error(`Dependency "${key}" not registered in container`)
      }
      this.singletons.set(key, factory())
    }
    return this.singletons.get(key) as T
  }

  /**
   * Verifica si una dependencia está registrada.
   */
  has(key: string): boolean {
    return (
      this.factories.has(key) || this.factories.has(`__transient__${key}`)
    )
  }

  /**
   * Limpia todas las instancias singleton (útil para testing).
   */
  clearSingletons(): void {
    this.singletons.clear()
  }

  /**
   * Limpia todo el contenedor (útil para testing).
   */
  reset(): void {
    this.singletons.clear()
    this.factories.clear()
  }
}

// Exportamos una instancia singleton del contenedor
export const container = new DIContainer()

// Exportamos también la clase para testing
export { DIContainer }
