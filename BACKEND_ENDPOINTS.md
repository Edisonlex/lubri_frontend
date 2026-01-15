# Endpoints del Backend - Sistema de Gestión de Lubricadora

## Resumen de Endpoints Necesarios

Este documento lista todos los endpoints que el backend necesita implementar para que el sistema funcione completamente.

## 🔐 Autenticación

### POST /api/auth/login
- **Descripción**: Iniciar sesión de usuario
- **Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, user: User, refreshToken: string }`

### POST /api/auth/refresh
- **Descripción**: Refrescar token de acceso
- **Body**: `{ refreshToken: string }`
- **Response**: `{ token: string, refreshToken: string }`

### POST /api/auth/logout
- **Descripción**: Cerrar sesión
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

## 📦 Productos

### GET /api/products
- **Descripción**: Obtener todos los productos
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Product[]`

### GET /api/products/{id}
- **Descripción**: Obtener producto por ID
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Product`

### POST /api/products
- **Descripción**: Crear nuevo producto
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Product`
- **Response**: `Product`

### PUT /api/products/{id}
- **Descripción**: Actualizar producto
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Partial<Product>`
- **Response**: `Product`

### DELETE /api/products/{id}
- **Descripción**: Eliminar producto
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

## 🛒 Ventas

### GET /api/sales
- **Descripción**: Obtener todas las ventas
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Sale[]`

### GET /api/sales/{id}
- **Descripción**: Obtener venta por ID
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Sale`

### POST /api/sales
- **Descripción**: Crear nueva venta
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Sale`
- **Response**: `Sale`

### PUT /api/sales/{id}
- **Descripción**: Actualizar venta
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Partial<Sale>`
- **Response**: `Sale`

### DELETE /api/sales/{id}
- **Descripción**: Eliminar venta
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

## 👥 Clientes

### GET /api/customers
- **Descripción**: Obtener todos los clientes
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Customer[]`

### GET /api/customers/{id}
- **Descripción**: Obtener cliente por ID
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Customer`

### POST /api/customers
- **Descripción**: Crear nuevo cliente
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Customer`
- **Response**: `Customer`

### PUT /api/customers/{id}
- **Descripción**: Actualizar cliente
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Partial<Customer>`
- **Response**: `Customer`

### DELETE /api/customers/{id}
- **Descripción**: Eliminar cliente
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

## 🏭 Proveedores

### GET /api/suppliers
- **Descripción**: Obtener todos los proveedores
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Supplier[]`

### GET /api/suppliers/{id}
- **Descripción**: Obtener proveedor por ID
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Supplier`

### POST /api/suppliers
- **Descripción**: Crear nuevo proveedor
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Supplier`
- **Response**: `Supplier`

### PUT /api/suppliers/{id}
- **Descripción**: Actualizar proveedor
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Partial<Supplier>`
- **Response**: `Supplier`

### DELETE /api/suppliers/{id}
- **Descripción**: Eliminar proveedor
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

## 📊 Análisis y Reportes

### GET /api/analytics/sales
- **Descripción**: Obtener análisis de ventas
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `SalesAnalytics`

### GET /api/analytics/inventory
- **Descripción**: Obtener análisis de inventario
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `InventoryAnalytics`

### GET /api/analytics/customers
- **Descripción**: Obtener análisis de clientes
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `CustomerAnalytics`

### GET /api/reports/inventory/pdf
- **Descripción**: Generar reporte de inventario en PDF
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Blob (PDF file)`

### GET /api/reports/inventory/excel
- **Descripción**: Generar reporte de inventario en Excel
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Blob (Excel file)`

### GET /api/reports/sales/pdf
- **Descripción**: Generar reporte de ventas en PDF
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Blob (PDF file)`

### GET /api/reports/sales/excel
- **Descripción**: Generar reporte de ventas en Excel
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Blob (Excel file)`

## 📈 Movimientos de Stock

### GET /api/stock-movements
- **Descripción**: Obtener todos los movimientos de stock
- **Headers**: `Authorization: Bearer {token}`
- **Query Params**: `?productId={id}` (opcional)
- **Response**: `StockMovement[]`

### POST /api/stock-movements
- **Descripción**: Crear movimiento de stock
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `StockMovement`
- **Response**: `StockMovement`

### PUT /api/stock-movements/{id}
- **Descripción**: Actualizar movimiento de stock
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Partial<StockMovement>`
- **Response**: `StockMovement`

### DELETE /api/stock-movements/{id}
- **Descripción**: Eliminar movimiento de stock
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

## ⚠️ Alertas

### GET /api/alerts
- **Descripción**: Obtener todas las alertas
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `StockAlert[]`

### GET /api/alerts/{id}
- **Descripción**: Obtener alerta por ID
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `StockAlert`

### POST /api/alerts
- **Descripción**: Crear nueva alerta
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `StockAlert`
- **Response**: `StockAlert`

### PUT /api/alerts/{id}
- **Descripción**: Actualizar alerta
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Partial<StockAlert>`
- **Response**: `StockAlert`

### DELETE /api/alerts/{id}
- **Descripción**: Eliminar alerta
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

### POST /api/alerts/{id}/resolve
- **Descripción**: Resolver alerta
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

### POST /api/alerts/check
- **Descripción**: Verificar y crear alertas de stock
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ products: Product[] }`
- **Response**: `{ alertsCreated: number }`

## 🔮 Pronóstico y Obsolescencia

### GET /api/forecast/demand
- **Descripción**: Obtener pronóstico de demanda
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `DemandForecast[]`

### GET /api/analytics/obsolescence
- **Descripción**: Obtener métricas de obsolescencia
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `ObsolescenceMetrics`

### GET /api/analytics/classification
- **Descripción**: Obtener clasificación de productos
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `ProductClassification[]`

## 👤 Usuarios

### GET /api/users
- **Descripción**: Obtener todos los usuarios
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `User[]`

### GET /api/users/{id}
- **Descripción**: Obtener usuario por ID
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `User`

### POST /api/users
- **Descripción**: Crear nuevo usuario
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `User`
- **Response**: `User`

### PUT /api/users/{id}
- **Descripción**: Actualizar usuario
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Partial<User>`
- **Response**: `User`

### DELETE /api/users/{id}
- **Descripción**: Eliminar usuario
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ success: boolean }`

## 🗺️ GIS y Ubicaciones

### GET /api/locations
- **Descripción**: Obtener todas las ubicaciones
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Location[]`

### GET /api/locations/{id}
- **Descripción**: Obtener ubicación por ID
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `Location`

### POST /api/locations
- **Descripción**: Crear nueva ubicación
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `Location`
- **Response**: `Location`

## 📋 Notas Importantes para el Backend

### Autenticación
- Todos los endpoints (excepto login/refresh) requieren token JWT
- El token debe enviarse en el header: `Authorization: Bearer {token}`
- Implementar refresh token mechanism

### Respuestas Estándar
- Éxito: HTTP 200 con objeto de datos
- Error: HTTP 400/404/500 con `{ error: string, details?: any }`
- Paginación: Usar `{ data: T[], total: number, page: number, limit: number }`

### Base de Datos
- Usar UUIDs para IDs (v4)
- Timestamps: `created_at`, `updated_at` en todas las tablas
- Soft delete: Usar `deleted_at` campo
- Índices en campos de búsqueda frecuente

### Seguridad
- Validar todos los inputs
- Sanitizar datos antes de guardar
- Implementar rate limiting
- Usar HTTPS en producción
- Hashear passwords con bcrypt

### Triggers y Automatización
- Actualizar stock automáticamente cuando se crea venta
- Calcular estadísticas de clientes después de cada venta
- Crear alertas cuando el stock está bajo
- Actualizar fecha de última venta en productos

Este documento debe usarse como guía para implementar el backend completo del sistema.