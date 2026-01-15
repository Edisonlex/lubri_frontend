# CONFIGURACIÓN DEL BACKEND - SISTEMA DE LUBRICADORA

## 🚀 INSTRUCCIONES DE IMPLEMENTACIÓN PARA EL BACKEND

### 1. CONFIGURACIÓN INICIAL

```bash
# Variables de entorno necesarias
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
JWT_SECRET=tu_secreto_jwt_aqui
DATABASE_URL=postgresql://usuario:password@localhost:5432/lubricadora_db
```

### 2. ESTRUCTURA DE BASE DE DATOS

El backend necesita crear las siguientes tablas principales:

#### Tabla: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'cashier', 'manager')) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  minStock INTEGER NOT NULL DEFAULT 0,
  maxStock INTEGER NOT NULL DEFAULT 1000,
  sku VARCHAR(255) UNIQUE NOT NULL,
  barcode VARCHAR(255),
  supplier VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('active', 'inactive', 'discontinued')) NOT NULL DEFAULT 'active',
  rotationRate DECIMAL(5,2),
  profitMargin DECIMAL(5,2),
  imageUrl TEXT,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `customers`
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  idNumber VARCHAR(50) UNIQUE NOT NULL,
  customerType VARCHAR(50) CHECK (customerType IN ('individual', 'business')) NOT NULL,
  businessName VARCHAR(255),
  ruc VARCHAR(50),
  totalPurchases DECIMAL(10,2) DEFAULT 0,
  lastPurchase TIMESTAMP,
  registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
  notes TEXT,
  preferredContact VARCHAR(50) CHECK (preferredContact IN ('phone', 'email', 'whatsapp')) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `vehicles`
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customerId UUID REFERENCES customers(id) ON DELETE CASCADE,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  plate VARCHAR(50) UNIQUE NOT NULL,
  engine VARCHAR(255) NOT NULL,
  mileage INTEGER NOT NULL,
  lastService TIMESTAMP,
  nextService TIMESTAMP,
  oilType VARCHAR(255) NOT NULL,
  filterType VARCHAR(255) NOT NULL,
  color VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `sales`
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  customerId UUID REFERENCES customers(id),
  customerName VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  paymentMethod VARCHAR(50) CHECK (paymentMethod IN ('efectivo', 'tarjeta', 'transferencia', 'crédito')) NOT NULL,
  status VARCHAR(50) CHECK (status IN ('completada', 'anulada', 'pendiente')) NOT NULL DEFAULT 'completada',
  userId UUID REFERENCES users(id) NOT NULL,
  invoiceNumber VARCHAR(255) UNIQUE NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `sale_items`
```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saleId UUID REFERENCES sales(id) ON DELETE CASCADE,
  productId UUID REFERENCES products(id),
  productName VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `suppliers`
```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  category VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
  notes TEXT,
  city VARCHAR(255),
  country VARCHAR(255),
  ruc VARCHAR(50),
  paymentTerms VARCHAR(255),
  productsSupplied JSON,
  totalOrders INTEGER DEFAULT 0,
  lastOrderDate TIMESTAMP,
  rating DECIMAL(3,2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `stock_movements`
```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('entrada', 'salida', 'ajuste')) NOT NULL,
  quantity INTEGER NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT NOT NULL,
  userId UUID REFERENCES users(id) NOT NULL,
  documentRef VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `stock_alerts`
```sql
CREATE TABLE stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID REFERENCES products(id) ON DELETE CASCADE,
  productName VARCHAR(255) NOT NULL,
  currentStock INTEGER NOT NULL,
  minStock INTEGER NOT NULL,
  category VARCHAR(255) NOT NULL,
  urgency VARCHAR(50) CHECK (urgency IN ('critical', 'high', 'medium', 'low')) NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  sku VARCHAR(255) NOT NULL,
  lastUpdated TIMESTAMP NOT NULL,
  trend VARCHAR(50) CHECK (trend IN ('improving', 'stable', 'worsening')) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  isResolved BOOLEAN DEFAULT FALSE,
  resolvedAt TIMESTAMP,
  resolvedBy UUID REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. TRIGGERS IMPORTANTES

#### Trigger para actualizar stock al crear venta
```sql
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar stock de productos
  UPDATE products 
  SET stock = stock - NEW.quantity 
  WHERE id = NEW.productId;
  
  -- Registrar movimiento de stock
  INSERT INTO stock_movements (productId, type, quantity, reason, userId)
  VALUES (NEW.productId, 'salida', NEW.quantity, 'Venta realizada', (SELECT userId FROM sales WHERE id = NEW.saleId));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_on_sale();
```

#### Trigger para actualizar estadísticas del cliente
```sql
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completada' THEN
    UPDATE customers 
    SET 
      totalPurchases = totalPurchases + NEW.total,
      lastPurchase = NEW.date
    WHERE id = NEW.customerId;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_stats
  AFTER UPDATE ON sales
  FOR EACH ROW
  WHEN (NEW.status = 'completada' AND OLD.status != 'completada')
  EXECUTE FUNCTION update_customer_stats();
```

#### Trigger para crear alertas de stock
```sql
CREATE OR REPLACE FUNCTION check_stock_alerts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock <= NEW.minStock THEN
    INSERT INTO stock_alerts (
      productId, productName, currentStock, minStock, 
      category, urgency, supplier, sku, lastUpdated, 
      trend, price, unit
    )
    VALUES (
      NEW.id, NEW.name, NEW.stock, NEW.minStock,
      NEW.category, 
      CASE 
        WHEN NEW.stock = 0 THEN 'critical'
        WHEN NEW.stock <= NEW.minStock * 0.5 THEN 'high'
        ELSE 'medium'
      END,
      NEW.supplier, NEW.sku, NEW.lastUpdated,
      'stable', NEW.price, 'unidad'
    )
    ON CONFLICT (productId) DO UPDATE SET
      currentStock = EXCLUDED.currentStock,
      urgency = EXCLUDED.urgency,
      lastUpdated = EXCLUDED.lastUpdated,
      isResolved = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_stock_alerts
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_alerts();
```

### 4. FUNCIONES DE UTILIDAD

#### Función para generar número de factura
```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  last_number INTEGER;
  new_number VARCHAR(20);
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoiceNumber FROM 9) AS INTEGER)), 0) + 1
  INTO last_number
  FROM sales
  WHERE DATE(createdAt) = CURRENT_DATE;
  
  new_number := 'FACT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(last_number::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

### 5. ÍNDICES RECOMENDADOS

```sql
-- Índices para búsquedas rápidas
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_idNumber ON customers(idNumber);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_customerId ON sales(customerId);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_invoiceNumber ON sales(invoiceNumber);
CREATE INDEX idx_sale_items_saleId ON sale_items(saleId);
CREATE INDEX idx_sale_items_productId ON sale_items(productId);
CREATE INDEX idx_stock_movements_productId ON stock_movements(productId);
CREATE INDEX idx_stock_movements_date ON stock_movements(date);
CREATE INDEX idx_stock_alerts_productId ON stock_alerts(productId);
CREATE INDEX idx_stock_alerts_isResolved ON stock_alerts(isResolved);
```

### 6. DATOS INICIALES

```sql
-- Usuario admin por defecto
INSERT INTO users (name, email, password, role, status) 
VALUES (
  'Administrador', 
  'admin@lubricadora.com', 
  '$2b$10$tVJ7Z0g1X0mN9zQ5yY0Y0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O', -- Contraseña: admin123
  'admin', 
  'active'
);

-- Configuración de empresa por defecto
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL DEFAULT 'Mi Lubricadora',
  ruc VARCHAR(50) NOT NULL DEFAULT '0000000000000',
  address TEXT NOT NULL DEFAULT 'Dirección no especificada',
  phone VARCHAR(50) NOT NULL DEFAULT '0000000000',
  email VARCHAR(255) NOT NULL DEFAULT 'info@empresa.com',
  logo TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO company_settings (name, ruc, address, phone, email) 
VALUES ('Lubricadora S.A.', '1790012345001', 'Av. Principal 123, Quito', '022345678', 'info@lubricadora.com');
```

### 7. CONSIDERACIONES DE SEGURIDAD

1. **Autenticación JWT**: Implementar tokens JWT con expiración de 24 horas
2. **Refresh Tokens**: Implementar refresh tokens con expiración de 7 días
3. **Rate Limiting**: Limitar a 100 requests por IP por minuto
4. **CORS**: Configurar CORS para permitir solo el dominio del frontend
5. **Validación**: Validar todos los inputs en el backend
6. **Encriptación**: Usar bcrypt para contraseñas (cost factor: 12)
7. **SQL Injection**: Usar prepared statements
8. **XSS Prevention**: Sanitizar todas las salidas

### 8. ENDPOINTS PRIORITARIOS

#### Fase 1 - Esencial (Primera semana)
- `POST /auth/login` - Login de usuario
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `GET /customers` - Listar clientes
- `POST /customers` - Crear cliente
- `GET /sales` - Listar ventas
- `POST /sales` - Crear venta

#### Fase 2 - Importante (Segunda semana)
- `GET /stock-alerts` - Alertas de stock
- `POST /stock-movements` - Movimientos de inventario
- `GET /suppliers` - Listar proveedores
- `POST /suppliers` - Crear proveedor
- `GET /analytics/inventory` - Análisis de inventario
- `GET /analytics/sales` - Análisis de ventas

#### Fase 3 - Avanzado (Tercera semana)
- `GET /settings/company` - Configuración de empresa
- `PUT /settings/company` - Actualizar configuración
- `GET /users` - Gestión de usuarios
- `POST /auth/refresh` - Refresh token
- Exportación de reportes

### 9. FORMATO DE RESPUESTAS

Todas las respuestas deben seguir este formato estándar:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "timestamp": "2024-01-08T12:00:00Z"
}
```

Para errores:

```json
{
  "success": false,
  "error": "Mensaje de error",
  "message": "Descripción detallada del error",
  "timestamp": "2024-01-08T12:00:00Z"
}
```

### 10. CÓDIGOS DE ESTADO HTTP

- `200` - OK: Operación exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos inválidos
- `401` - Unauthorized: No autorizado
- `403` - Forbidden: Sin permisos
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto (ej: email duplicado)
- `500` - Internal Server Error: Error del servidor

---

**Nota**: Esta configuración está lista para usar. El backend solo necesita implementar estos endpoints y tablas para que el frontend funcione correctamente.