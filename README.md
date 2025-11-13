# FitBalance

Aplicación web para realizar valoraciones morfofuncionales (IMC, GEB, GET), calcular el balance calórico y generar recomendaciones personalizadas de actividad física y nutrición.

## Stack Tecnológico

- **Backend**: Laravel 12 (API REST)
- **Frontend**: React 19 + Vite
- **Base de Datos**: MySQL
- **Autenticación**: Laravel Sanctum
- **Estilos**: Tailwind CSS

## Características

- ✅ Registro e inicio de sesión de usuarios
- ✅ Valoraciones morfofuncionales:
  - IMC (Índice de Masa Corporal)
  - GEB (Gasto Energético Basal) - Fórmula de Harris-Benedict
  - GET (Gasto Energético Total) - Basado en nivel de actividad
  - Balance calórico
- ✅ Recomendaciones personalizadas:
  - Recomendaciones nutricionales basadas en IMC y GET
  - Recomendaciones de ejercicio según nivel de actividad
- ✅ Historial de valoraciones
- ✅ Dashboard interactivo

## Instalación

### Backend (Laravel)

1. Navega al directorio del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
composer install
```

3. Copia el archivo de entorno:
```bash
cp .env.example .env
```

4. Genera la clave de la aplicación:
```bash
php artisan key:generate
```

5. Configura la base de datos en `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fitbalance
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

6. Ejecuta las migraciones:
```bash
php artisan migrate
```

7. Inicia el servidor de desarrollo:
```bash
php artisan serve
```

El backend estará disponible en `http://localhost:8000`

### Frontend (React)

1. Navega al directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo de entorno:
```bash
cp .env.example .env
```

4. Asegúrate de que `VITE_API_URL` en `.env` apunte a tu backend:
```env
VITE_API_URL=http://localhost:8000/api
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
FitBalance/
├── backend/                 # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── AssessmentController.php
│   │   │   └── RecommendationController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Assessment.php
│   │       └── Recommendation.php
│   ├── database/migrations/
│   ├── routes/api.php
│   └── bootstrap/app.php
│
└── frontend/                # React App
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── AssessmentForm.jsx
    │   │   └── AssessmentHistory.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## API Endpoints

### Autenticación
- `POST /api/register` - Registrar nuevo usuario
- `POST /api/login` - Iniciar sesión
- `POST /api/logout` - Cerrar sesión (requiere autenticación)
- `GET /api/user` - Obtener usuario autenticado (requiere autenticación)

### Valoraciones
- `GET /api/assessments` - Listar todas las valoraciones del usuario
- `POST /api/assessments` - Crear nueva valoración
- `GET /api/assessments/{id}` - Obtener valoración específica
- `GET /api/assessments/{id}/recommendations` - Obtener recomendaciones de una valoración

## Cálculos Implementados

### IMC (Índice de Masa Corporal)
```
IMC = peso (kg) / (estatura (m))²
```

### GEB (Gasto Energético Basal) - Fórmula de Harris-Benedict
- **Hombres**: GEB = 88.362 + (13.397 × peso) + (4.799 × estatura) - (5.677 × edad)
- **Mujeres**: GEB = 447.593 + (9.247 × peso) + (3.098 × estatura) - (4.330 × edad)

### GET (Gasto Energético Total)
```
GET = GEB × Factor de Actividad
```

Factores de actividad:
- Sedentario: 1.2
- Ligero: 1.375
- Moderado: 1.55
- Activo: 1.725
- Muy activo: 1.9

### Balance Calórico
```
Balance = Ingesta Calórica Diaria - GET
```

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

