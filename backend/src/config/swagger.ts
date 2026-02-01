import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import type { Express } from 'express'
import { config } from './config'

/**
 * Swagger/OpenAPI configuration for the RodaMallorca API
 */
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RodaMallorca API',
      version: '1.0.0',
      description: `
API para la plataforma RodaMallorca - Gestión de talleres de bicicletas, alquileres y servicios.

## Autenticación
La mayoría de los endpoints requieren autenticación mediante JWT.
Incluye el token en el header Authorization: Bearer {token}

## Módulos principales
- **Auth**: Autenticación y gestión de usuarios
- **Workshops**: Gestión de talleres
- **Products**: Catálogo de productos
- **Orders**: Pedidos y compras
- **Rentals**: Alquiler de bicicletas
- **Services**: Servicios de reparación
- **Payments**: Procesamiento de pagos con Stripe
- **Subscriptions**: Planes de suscripción para talleres
      `,
      contact: {
        name: 'RodaMallorca Support',
        email: 'support@rodamallorca.es',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.rodamallorca.es',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce tu token JWT',
        },
      },
      schemas: {
        // Auth schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'WORKSHOP_OWNER']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' },
          },
        },
        // Workshop schemas
        Workshop: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            imageUrl: { type: 'string', format: 'uri' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Product schemas
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'integer' },
            category: { type: 'string' },
            imageUrl: { type: 'string', format: 'uri' },
            workshopId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Order schemas
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            workshopId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'],
            },
            totalAmount: { type: 'number' },
            currency: { type: 'string', default: 'EUR' },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid', nullable: true },
            quantity: { type: 'integer' },
            priceAtOrder: { type: 'number' },
            description: { type: 'string', nullable: true },
          },
        },
        // Rental schemas
        RentalBike: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workshopId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            bikeType: {
              type: 'string',
              enum: ['ROAD', 'MOUNTAIN', 'CITY', 'ELECTRIC', 'GRAVEL', 'HYBRID'],
            },
            bikeSize: { type: 'string' },
            dailyPrice: { type: 'number' },
            weeklyPrice: { type: 'number', nullable: true },
            depositAmount: { type: 'number' },
            quantity: { type: 'integer' },
            imageUrl: { type: 'string', format: 'uri' },
            includesHelmet: { type: 'boolean' },
            includesLock: { type: 'boolean' },
            isActive: { type: 'boolean' },
          },
        },
        // Service schemas
        Service: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workshopId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            estimatedDuration: { type: 'integer', description: 'Duration in minutes' },
            category: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        // Common schemas
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso no proporcionado o inválido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: 'No autorizado',
                message: 'Token no proporcionado o inválido',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'No tienes permisos para acceder a este recurso',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: 'Prohibido',
                message: 'No tienes permiso para acceder a este recurso',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: 'No encontrado',
                message: 'El recurso solicitado no existe',
              },
            },
          },
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                error: 'Error de validación',
                message: 'email: El email no es válido',
                details: [
                  { path: ['email'], message: 'El email no es válido' },
                ],
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y gestión de sesiones' },
      { name: 'Users', description: 'Gestión de usuarios' },
      { name: 'Workshops', description: 'Gestión de talleres' },
      { name: 'Products', description: 'Catálogo de productos' },
      { name: 'Orders', description: 'Gestión de pedidos' },
      { name: 'Rentals', description: 'Alquiler de bicicletas' },
      { name: 'Services', description: 'Servicios de reparación' },
      { name: 'Payments', description: 'Procesamiento de pagos' },
      { name: 'Subscriptions', description: 'Planes de suscripción' },
      { name: 'Reviews', description: 'Reseñas y valoraciones' },
      { name: 'Favorites', description: 'Gestión de favoritos' },
      { name: 'Customers', description: 'Gestión de clientes' },
      { name: 'Media', description: 'Gestión de archivos multimedia' },
    ],
  },
  // Path to the API docs
  apis: [
    './src/modules/**/interfaces/http/*.routes.ts',
    './src/modules/**/routes/*.routes.ts',
  ],
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

/**
 * Setup Swagger UI in the Express app
 */
export function setupSwagger(app: Express): void {
  // Serve Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'RodaMallorca API Docs',
    })
  )

  // Serve raw OpenAPI spec as JSON
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  console.log(`📚 Swagger UI disponible en: http://localhost:${config.port}/api/docs`)
}

export { swaggerSpec }
