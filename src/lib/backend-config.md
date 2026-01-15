# Configuración del Backend - Sistema de Gestión de Lubricadora

## Variables de Entorno

Estas son las variables de entorno necesarias para configurar la conexión con el backend:

### 🔗 Conexión a la API

```bash
# URL del backend
NEXT_PUBLIC_API_URL=http://localhost:3001
# o para producción
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api

# Timeout de peticiones (en milisegundos)
API_TIMEOUT=30000
```

### 🔐 Autenticación JWT

```bash
# Secret para JWT (lado del backend)
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Refresh token
JWT_REFRESH_SECRET=tu_refresh_secreto_super_seguro
JWT_REFRESH_EXPIRES_IN=7d
```

### 🗄️ Base de Datos

```bash
# PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/lubricadora_db

# Configuración de conexión
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lubricadora_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
```

### 📧 Email (opcional - para notificaciones)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
```

### 🌐 CORS

```bash
# Orígenes permitidos (separados por comas)
CORS_ORIGINS=http://localhost:3000,https://tu-dominio-frontend.com
```r>
## Configuración del Servidor

### Puerto
```bash
# Puerto donde correrá el backend (por defecto 3001)
PORT=3001
```

### Entorno
```bash
# development, production
NODE_ENV=development
```

### Logs
```bash
# Nivel de logs: error, warn, info, debug
LOG_LEVEL=info
```

## 🔧 Configuración de Seguridad

### Rate Limiting
```bash
# Límite de peticiones por IP (por minuto)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Bcrypt
```bash
# Salt rounds para hashing de contraseñas
BCRYPT_SALT_ROUNDS=12
```

## 📁 Configuración de Archivos

### Uploads
```bash
# Máximo tamaño de archivo (en bytes)
MAX_FILE_SIZE=5242880  # 5MB

# Tipos de archivo permitidos
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Directorio de uploads
UPLOAD_DIR=./uploads
```

### Reportes
```bash
# Directorio temporal para reportes
TEMP_DIR=./temp
# Directorio para reportes generados
REPORTS_DIR=./reports
```

## 🔄 Configuración de Triggers

### Actualización Automática de Stock
```bash
# Habilitar actualización automática de stock
AUTO_UPDATE_STOCK=true

# Habilitar cálculo de estadísticas de clientes
AUTO_CALCULATE_CUSTOMER_STATS=true

# Habilitar creación automática de alertas
AUTO_CREATE_ALERTS=true
```

## 🚨 Configuración de Alertas

### Umbrales de Stock
```bash
# Porcentaje mínimo de stock para alertas (0.0 - 1.0)
STOCK_ALERT_THRESHOLD=0.2  # 20%

# Días para considerar producto obsoleto
OBSOLESCENCE_DAYS=180
```

## 🌍 Configuración de Analytics

### Pronóstico de Demanda
```bash
# Período de análisis para pronóstico (en días)
FORECAST_ANALYSIS_PERIOD=365

# Método de pronóstico: moving_average, exponential_smoothing, linear_regression
FORECAST_METHOD=moving_average
```

## 📊 Configuración de Reportes

### Generación de Reportes
```bash
# Formato de fecha para reportes
REPORT_DATE_FORMAT=DD/MM/YYYY

# Zona horaria
TIMEZONE=America/New_York

# Idioma de los reportes
REPORT_LANGUAGE=es
```

## 🔍 Configuración de Debugging

### Desarrollo
```bash
# Habilitar logs detallados
DEBUG=true

# Habilitar stack traces completos
SHOW_STACK_TRACE=true

# Habilitar query logging
LOG_QUERIES=true
```

## 📝 Notas Importantes

### Seguridad
- Nunca hardcodees las contraseñas en el código
- Usa variables de entorno para toda la configuración sensible
- Implementa validación de todas las variables requeridas al iniciar el servidor

### Desarrollo vs Producción
- En desarrollo, puedes usar valores más permisivos
- En producción, asegúrate de usar contraseñas fuertes y configuraciones seguras
- Siempre usa HTTPS en producción

### Validación
El backend debe validar que todas estas variables estén configuradas correctamente al iniciar:

```javascript
// Ejemplo de validación
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'JWT_SECRET',
  'DATABASE_URL',
  'CORS_ORIGINS'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno requerida faltante: ${envVar}`);
  }
});
```

### Archivo .env de Ejemplo
Crea un archivo `.env` en la raíz del proyecto backend con estas variables:

```bash
# .env
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui
JWT_EXPIRES_IN=24h
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/lubricadora_db
CORS_ORIGINS=http://localhost:3000
PORT=3001
NODE_ENV=development
```

### Archivo .env.example
También crea un archivo `.env.example` para otros desarrolladores:

```bash
# .env.example
NEXT_PUBLIC_API_URL=
JWT_SECRET=
JWT_EXPIRES_IN=24h
DATABASE_URL=
CORS_ORIGINS=
PORT=3001
NODE_ENV=development
```

Esta configuración garantiza que el backend esté correctamente preparado para integrarse con el frontend que ya hemos configurado.