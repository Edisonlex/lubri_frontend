# Contrato de API y Estructura de Datos - Sistema Lubricadora

Este documento define las estructuras de datos JSON y los endpoints esperados por el Frontend para garantizar la correcta integración con el Backend.

## 1. Autenticación y Usuarios

### Roles del Sistema
El sistema maneja los siguientes roles (case-insensitive en el backend, pero mapeados en frontend):
- `admin` (Administrador): Acceso total.
- `cashier` (Cajero/Vendedor): Acceso a POS, Inventario (lectura), Clientes.
- `technician` (Técnico): Acceso a Servicios, Inventario (lectura).

### Objeto Usuario (User)
```json
{
  "id": "string (uuid)",
  "name": "string",
  "email": "string",
  "role": "admin" | "cashier" | "technician",
  "status": "active" | "inactive",
  "avatar": "string (url, opcional)"
}
```

### Endpoints
- **POST /api/auth/login**
  - Request: `{ "email": "...", "password": "..." }`
  - Response:
    ```json
    {
      "token": "string (jwt)",
      "expiresIn": number,
      "user": { ...User Object }
    }
    ```

## 2. Inventario y Productos

### Categorías Soportadas
- `aceites`, `filtros`, `lubricantes`, `aditivos`, `baterias`, `accesorios`, `refrigerantes`, `grasas`, `liquidos`

### Objeto Producto (Product)
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "sku": "string (único)",
  "price": number,
  "cost": number,
  "stock": number,
  "minStock": number,
  "category": "string (ver categorías)",
  "brand": "string",
  "location": "string (ej: Estante A1)",
  "supplier": "string (Nombre del proveedor)",
  "compatibility": ["string"] (ej: ["Toyota Corolla", "Nissan Sentra"]),
  "status": "active" | "low_stock" | "out_of_stock",
  "lastRestock": "string (ISO Date)",
  "image": "string (url, opcional)"
}
```

## 3. Ventas y Facturación (POS)

### Objeto Venta (Sale)
```json
{
  "id": "string",
  "invoiceNumber": "string",
  "date": "string (ISO Date)",
  "customerName": "string",
  "customerId": "string (opcional)",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": number,
      "unitPrice": number,
      "subtotal": number
    }
  ],
  "subtotal": number,
  "tax": number,
  "total": number,
  "paymentMethod": "cash" | "card" | "transfer",
  "status": "completed" | "pending" | "cancelled",
  "sellerId": "string"
}
```

## 4. Clientes

### Objeto Cliente (Customer)
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "idNumber": "string (Cédula/RUC)",
  "customerType": "individual" | "business",
  "vehicles": [
    {
      "plate": "string",
      "brand": "string",
      "model": "string",
      "year": number,
      "mileage": number,
      "lastServiceDate": "string (ISO Date)"
    }
  ],
  "totalPurchases": number,
  "lastPurchase": "string (ISO Date)",
  "status": "active" | "inactive"
}
```

## 5. Proveedores

### Objeto Proveedor (Supplier)
```json
{
  "id": "string",
  "name": "string",
  "contactPerson": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "taxId": "string (RUC)",
  "category": "string",
  "paymentTerms": "contado" | "credito_30" | "credito_60",
  "rating": number (1-5),
  "status": "active" | "inactive"
}
```

## 6. Reportes y Análisis

El frontend espera endpoints que devuelvan datos agregados o filtrados para:
- **Obsolescencia**: Productos sin ventas en X tiempo.
- **Clasificación ABC**: Productos ordenados por ingresos generados.
- **Ventas por Período**: Totales diarios/mensuales.

### Ejemplo Respuesta Dashboard
```json
{
  "totalRevenue": number,
  "salesCount": number,
  "lowStockCount": number,
  "recentSales": [ ...Sale Objects ],
  "topProducts": [ ...Product Objects ]
}
```

## Notas de Implementación
1. **Fechas**: Usar formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) para todas las fechas.
2. **Paginación**: Endpoints de listados (productos, ventas) deben soportar `?page=1&limit=10`.
3. **Errores**: Retornar códigos HTTP estándar (400, 401, 403, 404, 500) con cuerpo `{ "error": "Mensaje descriptivo" }`.
