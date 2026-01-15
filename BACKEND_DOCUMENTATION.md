# DOCUMENTACIÓN DE CAMPOS PARA EL BACKEND

## 📋 RESUMEN DE DATOS QUE NECESITA ALMACENAR EL BACKEND

Este documento describe todos los campos que el backend necesita manejar para que el sistema funcione correctamente.

---

## 🔐 1. MÓDULO DE AUTENTICACIÓN

### Tabla: `users` (Usuarios del sistema)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único del usuario |
| `name` | string | ✅ | Nombre completo del usuario |
| `email` | string | ✅ | Email único para login |
| `password` | string | ✅ | Contraseña hasheada |
| `role` | enum | ✅ | "admin" \| "cashier" \| "manager" |
| `status` | enum | ✅ | "active" \| "inactive" |
| `lastLogin` | datetime | ❌ | Último acceso al sistema |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Endpoints necesarios:
- `POST /auth/login` - Login de usuario
- `POST /auth/refresh` - Refrescar token
- `POST /auth/logout` - Cerrar sesión
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

---

## 📦 2. MÓDULO DE PRODUCTOS

### Tabla: `products` (Productos del inventario)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único del producto |
| `name` | string | ✅ | Nombre del producto |
| `brand` | string | ✅ | Marca del producto |
| `category` | string | ✅ | Categoría (ej: "Aceites", "Filtros") |
| `price` | decimal | ✅ | Precio de venta |
| `cost` | decimal | ✅ | Costo de compra |
| `stock` | integer | ✅ | Cantidad en inventario |
| `minStock` | integer | ✅ | Stock mínimo para alertas |
| `maxStock` | integer | ✅ | Stock máximo |
| `sku` | string | ✅ | Código único del producto |
| `barcode` | string | ❌ | Código de barras |
| `supplier` | string | ✅ | Proveedor principal |
| `location` | string | ✅ | Ubicación en almacén |
| `status` | enum | ✅ | "active" \| "inactive" \| "discontinued" |
| `rotationRate` | decimal | ❌ | Tasa de rotación |
| `profitMargin` | decimal | ❌ | Margen de ganancia |
| `imageUrl` | string | ❌ | URL de imagen del producto |
| `lastUpdated` | datetime | ✅ | Última actualización de stock |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Endpoints necesarios:
- `GET /products` - Listar productos (con filtros)
- `GET /products/:id` - Obtener producto específico
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

---

## 👥 3. MÓDULO DE CLIENTES

### Tabla: `customers` (Clientes)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único del cliente |
| `name` | string | ✅ | Nombre completo |
| `email` | string | ✅ | Email de contacto |
| `phone` | string | ✅ | Teléfono |
| `address` | string | ✅ | Dirección |
| `city` | string | ✅ | Ciudad |
| `idNumber` | string | ✅ | Cédula/RUC |
| `customerType` | enum | ✅ | "individual" \| "business" |
| `businessName` | string | ❌ | Nombre de empresa (si aplica) |
| `ruc` | string | ❌ | RUC de empresa (si aplica) |
| `totalPurchases` | decimal | ✅ | Total de compras acumuladas |
| `lastPurchase` | datetime | ❌ | Fecha de última compra |
| `registrationDate` | datetime | ✅ | Fecha de registro |
| `status` | enum | ✅ | "active" \| "inactive" |
| `notes` | text | ✅ | Notas adicionales |
| `preferredContact` | enum | ✅ | "phone" \| "email" \| "whatsapp" |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Tabla: `vehicles` (Vehículos de clientes)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único del vehículo |
| `customerId` | string | ✅ | ID del cliente propietario |
| `brand` | string | ✅ | Marca del vehículo |
| `model` | string | ✅ | Modelo del vehículo |
| `year` | integer | ✅ | Año del vehículo |
| `plate` | string | ✅ | Placa del vehículo |
| `engine` | string | ✅ | Tipo de motor |
| `mileage` | integer | ✅ | Kilometraje actual |
| `lastService` | datetime | ✅ | Fecha del último servicio |
| `nextService` | datetime | ✅ | Fecha del próximo servicio |
| `oilType` | string | ✅ | Tipo de aceite recomendado |
| `filterType` | string | ✅ | Tipo de filtro |
| `color` | string | ❌ | Color del vehículo |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Endpoints necesarios:
- `GET /customers` - Listar clientes (con filtros)
- `GET /customers/:id` - Obtener cliente específico
- `POST /customers` - Crear cliente
- `PUT /customers/:id` - Actualizar cliente
- `DELETE /customers/:id` - Eliminar cliente
- `GET /customers/:id/vehicles` - Obtener vehículos del cliente
- `POST /customers/:id/vehicles` - Agregar vehículo al cliente
- `PUT /vehicles/:id` - Actualizar vehículo
- `DELETE /vehicles/:id` - Eliminar vehículo

---

## 💰 4. MÓDULO DE VENTAS

### Tabla: `sales` (Ventas)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único de la venta |
| `date` | datetime | ✅ | Fecha y hora de la venta |
| `customerId` | string | ❌ | ID del cliente (puede ser null para ventas rápidas) |
| `customerName` | string | ❌ | Nombre del cliente (para ventas rápidas) |
| `subtotal` | decimal | ✅ | Subtotal sin impuestos |
| `tax` | decimal | ✅ | Total de impuestos |
| `total` | decimal | ✅ | Total de la venta |
| `paymentMethod` | enum | ✅ | "efectivo" \| "tarjeta" \| "transferencia" \| "crédito" |
| `status` | enum | ✅ | "completada" \| "anulada" \| "pendiente" |
| `userId` | string | ✅ | ID del usuario que realizó la venta |
| `invoiceNumber` | string | ✅ | Número de factura |
| `notes` | text | ❌ | Notas adicionales |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Tabla: `sale_items` (Items de ventas)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único del item |
| `saleId` | string | ✅ | ID de la venta |
| `productId` | string | ✅ | ID del producto |
| `productName` | string | ✅ | Nombre del producto (snapshot) |
| `quantity` | integer | ✅ | Cantidad vendida |
| `unitPrice` | decimal | ✅ | Precio unitario al momento de venta |
| `subtotal` | decimal | ✅ | Subtotal del item |
| `createdAt` | datetime | ✅ | Fecha de creación |

### Endpoints necesarios:
- `GET /sales` - Listar ventas (con filtros por fecha, cliente, etc.)
- `GET /sales/:id` - Obtener venta específica
- `POST /sales` - Crear venta
- `PUT /sales/:id/status` - Actualizar estado de venta
- `GET /sales/reports/daily` - Reporte de ventas diarias
- `GET /sales/reports/monthly` - Reporte de ventas mensuales

---

## 🚚 5. MÓDULO DE PROVEEDORES

### Tabla: `suppliers` (Proveedores)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único del proveedor |
| `name` | string | ✅ | Nombre del proveedor |
| `contactPerson` | string | ✅ | Persona de contacto |
| `email` | string | ✅ | Email de contacto |
| `phone` | string | ✅ | Teléfono de contacto |
| `address` | string | ✅ | Dirección |
| `category` | string | ❌ | Categoría de productos |
| `status` | enum | ✅ | "active" \| "inactive" |
| `notes` | text | ❌ | Notas adicionales |
| `city` | string | ❌ | Ciudad |
| `country` | string | ❌ | País |
| `ruc` | string | ❌ | RUC del proveedor |
| `paymentTerms` | string | ❌ | Términos de pago |
| `productsSupplied` | json | ❌ | Array de IDs de productos |
| `totalOrders` | integer | ❌ | Total de órdenes |
| `lastOrderDate` | datetime | ❌ | Fecha de última orden |
| `rating` | decimal | ❌ | Calificación (1-5) |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Endpoints necesarios:
- `GET /suppliers` - Listar proveedores
- `GET /suppliers/:id` - Obtener proveedor específico
- `POST /suppliers` - Crear proveedor
- `PUT /suppliers/:id` - Actualizar proveedor
- `DELETE /suppliers/:id` - Eliminar proveedor

---

## 📊 6. MÓDULO DE MOVIMIENTOS DE INVENTARIO

### Tabla: `stock_movements` (Movimientos de inventario)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único del movimiento |
| `productId` | string | ✅ | ID del producto |
| `type` | enum | ✅ | "entrada" \| "salida" \| "ajuste" |
| `quantity` | integer | ✅ | Cantidad del movimiento |
| `date` | datetime | ✅ | Fecha del movimiento |
| `reason` | string | ✅ | Razón del movimiento |
| `userId` | string | ✅ | ID del usuario que realizó el movimiento |
| `documentRef` | string | ❌ | Referencia de documento |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Endpoints necesarios:
- `GET /inventory/movements` - Listar movimientos (por producto, fecha, etc.)
- `POST /inventory/movements` - Crear movimiento de inventario
- `GET /inventory/movements/:id` - Obtener movimiento específico

---

## ⚠️ 7. MÓDULO DE ALERTAS

### Tabla: `stock_alerts` (Alertas de stock)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único de la alerta |
| `productId` | string | ✅ | ID del producto |
| `productName` | string | ✅ | Nombre del producto |
| `currentStock` | integer | ✅ | Stock actual |
| `minStock` | integer | ✅ | Stock mínimo |
| `category` | string | ✅ | Categoría del producto |
| `urgency` | enum | ✅ | "critical" \| "high" \| "medium" \| "low" |
| `supplier` | string | ✅ | Proveedor del producto |
| `sku` | string | ✅ | Código SKU |
| `lastUpdated` | datetime | ✅ | Última actualización de stock |
| `trend` | enum | ✅ | "improving" \| "stable" \| "worsening" |
| `price` | decimal | ✅ | Precio del producto |
| `unit` | string | ✅ | Unidad de medida |
| `isResolved` | boolean | ✅ | Estado de resolución |
| `resolvedAt` | datetime | ❌ | Fecha de resolución |
| `resolvedBy` | string | ❌ | ID del usuario que resolvió |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Endpoints necesarios:
- `GET /alerts/stock` - Listar alertas de stock
- `POST /alerts/stock/:id/resolve` - Marcar alerta como resuelta

---

## ⚙️ 8. MÓDULO DE CONFIGURACIÓN

### Tabla: `company_settings` (Configuración de la empresa)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único (solo un registro) |
| `name` | string | ✅ | Nombre de la empresa |
| `ruc` | string | ✅ | RUC de la empresa |
| `address` | string | ✅ | Dirección de la empresa |
| `phone` | string | ✅ | Teléfono de la empresa |
| `email` | string | ✅ | Email de la empresa |
| `logo` | string | ❌ | URL del logo |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Tabla: `branches` (Sucursales)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | UUID único de la sucursal |
| `name` | string | ✅ | Nombre de la sucursal |
| `address` | string | ✅ | Dirección de la sucursal |
| `phone` | string | ✅ | Teléfono de la sucursal |
| `email` | string | ✅ | Email de la sucursal |
| `isMain` | boolean | ✅ | Si es la sucursal principal |
| `status` | enum | ✅ | "active" \| "inactive" |
| `createdAt` | datetime | ✅ | Fecha de creación |
| `updatedAt` | datetime | ✅ | Última actualización |

### Endpoints necesarios:
- `GET /settings/company` - Obtener configuración de la empresa
- `PUT /settings/company` - Actualizar configuración de la empresa
- `GET /settings/branches` - Listar sucursales
- `POST /settings/branches` - Crear sucursal
- `PUT /settings/branches/:id` - Actualizar sucursal

---

## 📈 9. MÓDULO DE ANÁLISIS Y REPORTES

### Endpoints para análisis:
- `GET /analytics/inventory` - Análisis de inventario
- `GET /analytics/sales` - Análisis de ventas
- `GET /analytics/customers` - Análisis de clientes

### Datos que deben calcularse:
- **Inventario**: Distribución por categoría, niveles de stock, productos más vendidos, productos con bajo stock, valor total del inventario
- **Ventas**: Ventas diarias/mensuales, top de clientes, métodos de pago más usados, ticket promedio, tasa de crecimiento
- **Clientes**: Total de clientes, nuevos clientes del mes, clientes activos/inactivos, top de clientes por compras

---

## 🔑 CONSIDERACIONES IMPORTANTES PARA EL BACKEND

### 1. **Relaciones entre tablas:**
- `customers` → `vehicles` (1:N)
- `products` → `stock_movements` (1:N)
- `products` → `sale_items` (1:N)
- `sales` → `sale_items` (1:N)
- `customers` → `sales` (1:N)
- `users` → `sales` (1:N)
- `users` → `stock_movements` (1:N)
- `products` → `stock_alerts` (1:N)

### 2. **Triggers y validaciones:**
- Al crear una venta, actualizar el stock de los productos
- Al crear un movimiento de inventario, actualizar el stock del producto
- Verificar stock mínimo y crear alertas automáticamente
- Actualizar `totalPurchases` y `lastPurchase` del cliente cuando se crea una venta
- Generar número de factura automáticamente secuencial

### 3. **Índices recomendados:**
- `products.sku` (único)
- `products.category` (para búsquedas)
- `customers.email` (único)
- `customers.idNumber` (único)
- `sales.invoiceNumber` (único)
- `sales.date` (para reportes por fecha)
- `stock_movements.productId` (para consultas de movimientos)

### 4. **Seguridad:**
- Implementar autenticación JWT
- Validar roles de usuario para cada endpoint
- Sanitizar todas las entradas para prevenir SQL injection
- Implementar rate limiting
- Encriptar contraseñas con bcrypt o similar

### 5. **Formato de respuestas:**
Todas las respuestas deben seguir este formato:
```json
{
  "success": true,
  "data": {}, // o [] para listas
  "message": "Operación exitosa",
  "timestamp": "2024-01-08T12:00:00Z"
}
```

Para respuestas paginadas:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-08T12:00:00Z"
}
```

---

## 📋 RESUMEN DE PRIORIDADES PARA IMPLEMENTACIÓN

### **Fase 1 - Esencial (Primera semana)**
1. Autenticación de usuarios
2. CRUD de productos
3. CRUD de clientes
4. CRUD de ventas
5. Gestión de stock básico

### **Fase 2 - Importante (Segunda semana)**
1. Movimientos de inventario
2. Alertas de stock
3. Proveedores
4. Vehículos de clientes
5. Configuración de empresa

### **Fase 3 - Avanzado (Tercera semana)**
1. Análisis y reportes
2. Sistema de sucursales
3. Exportación de datos
4. Integración con SRI (si aplica)
5. Sistema de respaldos

---

**Nota:** Esta documentación está basada en el análisis completo del frontend. El backend debe implementar todos estos campos y endpoints para que el sistema funcione correctamente.