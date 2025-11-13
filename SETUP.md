# Guía de Configuración Rápida - FitBalance

## Requisitos Previos

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0

## Configuración Inicial

### 1. Base de Datos

Crea una base de datos MySQL:

```sql
CREATE DATABASE fitbalance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (Laravel)

```bash
cd backend

# Instalar dependencias
composer install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Editar .env y configurar:
# DB_DATABASE=fitbalance
# DB_USERNAME=tu_usuario
# DB_PASSWORD=tu_contraseña

# Ejecutar migraciones
php artisan migrate

# Iniciar servidor
php artisan serve
```

El backend estará en: `http://localhost:8000`

### 3. Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Verificar que VITE_API_URL=http://localhost:8000/api

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en: `http://localhost:5173`

## Uso

1. Abre `http://localhost:5173` en tu navegador
2. Regístrate con un nuevo usuario
3. Crea tu primera valoración morfofuncional
4. Revisa tus resultados y recomendaciones personalizadas

## Notas

- Asegúrate de que ambos servidores (backend y frontend) estén corriendo simultáneamente
- El backend debe estar en el puerto 8000
- El frontend debe estar en el puerto 5173 (o el que Vite asigne)

