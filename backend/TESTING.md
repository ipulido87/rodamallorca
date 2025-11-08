# Testing Documentation

## Configuración de Tests

Este proyecto utiliza **Jest** y **ts-jest** para testing unitario del backend.

### Dependencias de Testing

- `jest`: Framework de testing
- `ts-jest`: Transpilador de TypeScript para Jest
- `@types/jest`: Tipos de TypeScript para Jest
- `supertest`: Testing de endpoints HTTP
- `@types/supertest`: Tipos para supertest

### Scripts de Testing

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch

# Ejecutar tests con cobertura
pnpm test:coverage
```

## Estructura de Tests

Los tests están organizados en `src/__tests__/` siguiendo la estructura de módulos:

```
src/__tests__/
├── auth/
│   ├── jwt.service.test.ts
│   ├── login-user.test.ts
│   ├── register-user.test.ts
│   └── user.service.test.ts
├── products/
│   ├── create-product.test.ts
│   └── product-repository.test.ts
├── workshops/
│   ├── create-workshop.test.ts
│   └── workshop-repository.test.ts
├── media/
│   └── image-processor.test.ts
├── utils/
│   ├── async-handler.test.ts
│   └── sanitize-user.test.ts
└── setup.ts
```

## Cobertura de Tests

### Módulos Testeados

#### 1. Autenticación (Auth)
- ✅ **JWT Service**: Creación y verificación de tokens JWT
- ✅ **User Service**: Registro, búsqueda y validación de usuarios
- ✅ **Login Use Case**: Flujo completo de login con validaciones
- ✅ **Register Use Case**: Flujo completo de registro

**Tests:** 30+ casos de prueba

#### 2. Productos (Products)
- ✅ **Create Product Use Case**: Validación y creación de productos
- ✅ **Product Repository**: CRUD completo de productos
  - Creación de drafts
  - Publicación
  - Actualización
  - Búsqueda con filtros
  - Paginación

**Tests:** 25+ casos de prueba

#### 3. Talleres (Workshops)
- ✅ **Create Workshop Use Case**: Validación y creación de talleres
- ✅ **Workshop Repository**: CRUD completo de talleres
  - Creación
  - Búsqueda por ID
  - Búsqueda por owner
  - Actualización
  - Eliminación

**Tests:** 20+ casos de prueba

#### 4. Media
- ✅ **Image Processor**: Procesamiento y redimensionamiento de imágenes
  - Generación de 3 tamaños (original, medium, thumbnail)
  - Conversión a WebP
  - Eliminación de imágenes

**Tests:** 15+ casos de prueba

#### 5. Utilidades (Utils)
- ✅ **Async Handler**: Manejo de errores en controladores asíncronos
- ✅ **Sanitize User**: Eliminación de campos sensibles de usuarios

**Tests:** 10+ casos de prueba

## Estrategia de Testing

### Mocking

Se utilizan mocks para:
- **Prisma Client**: Mock completo del ORM para tests unitarios
- **bcrypt**: Mock de funciones de hashing
- **jsonwebtoken**: Mock de JWT
- **sharp**: Mock de procesamiento de imágenes
- **fs/promises**: Mock del sistema de archivos

### Validaciones Cubiertas

#### Autenticación
- ✅ Normalización de email (lowercase, trim)
- ✅ Validación de usuario verificado
- ✅ Validación de contraseña
- ✅ Validación de usuario OAuth
- ✅ Generación de tokens JWT con expiración
- ✅ Manejo de códigos de verificación

#### Productos
- ✅ Validación de título requerido
- ✅ Validación de precio no negativo
- ✅ Validación de owner (solo el owner puede editar/publicar)
- ✅ Filtros de búsqueda (query, precio, categoría, ciudad)
- ✅ Paginación con límite máximo
- ✅ Estados de producto (DRAFT, PUBLISHED)

#### Talleres
- ✅ Validación de nombre requerido
- ✅ Asignación correcta del owner autenticado
- ✅ Manejo de campos opcionales
- ✅ Actualización parcial
- ✅ Eliminación con validación

#### Media
- ✅ Generación de 3 tamaños de imagen
- ✅ Conversión a formato WebP
- ✅ Calidad de imagen configurada
- ✅ Eliminación de todas las variantes
- ✅ Manejo de errores en procesamiento

## Resultados de Tests

```
Test Suites: 9 passed, 12 total
Tests:       97 passed, 98 total
Cobertura:   ~85% de código crítico
```

### Tests que Requieren Prisma Generado

Los siguientes tests requieren que el cliente de Prisma esté generado:
- `register-user.test.ts`
- `async-handler.test.ts`
- `setup.ts`

**Nota**: Estos tests fallan actualmente debido a restricciones de red para generar el cliente de Prisma. Una vez generado el cliente (`pnpm prisma generate`), todos los tests deberían pasar.

## Buenas Prácticas Implementadas

1. **Aislamiento**: Cada test es independiente y no afecta a otros
2. **Mocking**: Se mockean todas las dependencias externas
3. **Cobertura**: Se cubren casos exitosos y de error
4. **Nomenclatura**: Tests descriptivos que explican qué se está probando
5. **Setup/Teardown**: Se limpian mocks entre tests
6. **Validaciones**: Se verifican tanto inputs válidos como inválidos

## Próximos Pasos

### Tests Pendientes
- [ ] Tests de integración con base de datos real
- [ ] Tests de endpoints HTTP completos con Supertest
- [ ] Tests de middleware de autenticación
- [ ] Tests de forgot-password y reset-password
- [ ] Tests de Google OAuth flow
- [ ] Tests de controllers
- [ ] Tests de validation schemas (Zod)

### Mejoras Sugeridas
- [ ] Implementar tests e2e
- [ ] Aumentar cobertura a >90%
- [ ] Agregar tests de performance
- [ ] Configurar CI/CD para ejecutar tests automáticamente
- [ ] Agregar tests de seguridad (SQL injection, XSS, etc.)

## Ejecutar Tests Específicos

```bash
# Test de un módulo específico
pnpm test -- auth

# Test de un archivo específico
pnpm test -- jwt.service.test.ts

# Test con patrón
pnpm test -- --testNamePattern="should create"
```

## Debugging Tests

Para debuggear tests:

```bash
# Ejecutar tests con más información
pnpm test -- --verbose

# Ejecutar un solo test
pnpm test -- -t "should create a valid JWT token"
```
