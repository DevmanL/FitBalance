## Informe Completo del Proyecto FitBalance

### 1. Visión General

**FitBalance** es una aplicación web para realizar valoraciones morfofuncionales y seguimiento nutricional/de actividad física, orientada a un modelo con:
- Usuarios finales (clientes) que se valoran y reciben recomendaciones.
- Nutricionistas que gestionan a sus propios clientes.
- Administradores y Super Admin que gestionan el sistema y analizan métricas globales.

Stack principal:
- **Backend:** Laravel (PHP) + MySQL.
- **Frontend:** React + Vite + TailwindCSS.
- **Autenticación:** Laravel Sanctum (tokens Bearer).
- **Autorización:** Spatie Laravel Permission (roles y permisos).

---

### 2. Arquitectura Funcional

#### 2.1 Roles y Permisos

Roles principales:
- `super_admin`
- `admin`
- `nutritionist`
- `user` (rol por defecto)

Características clave:
- Todos los nuevos registros obtienen el rol `user`.
- `super_admin`:
  - Control total del sistema y configuración.
  - Ve **todas** las métricas globales.
  - Asigna cada usuario cliente a un nutricionista.
  - Ve estadísticas agregadas por nutricionista (clientes, anotaciones, recomendaciones, engagement).
- `admin`:
  - Gestiona usuarios (crear, editar, eliminar).
  - Gestiona valoraciones (ver/editar/borrar según permisos).
  - Accede a un dashboard con estadísticas globales, pero sin configuraciones críticas.
- `nutritionist`:
  - Solo ve **sus propios clientes** (usuarios con `assigned_nutritionist_id = su id`).
  - Solo ve valoraciones de **sus clientes**.
  - Puede crear y editar anotaciones sobre las valoraciones de sus clientes.
  - Dispone de un dashboard propio con métricas de su cartera de clientes.
- `user`:
  - Crea valoraciones morfofuncionales.
  - Ve su propio historial y recomendaciones.
  - Gestiona su propio perfil (preferencias, alergias, objetivos, notas para su nutricionista).

Los permisos se configuran en `RolePermissionSeeder` y se documentan en `ROLES_DOCUMENTATION.md`.

---

### 3. Backend (Laravel)

#### 3.1 Modelos Principales

- `User`
  - Campos: `name`, `email`, `password`, `assigned_nutritionist_id`, timestamps.
  - Relaciones:
    - `assessments()` → `hasMany(Assessment)`.
    - `profile()` → `hasOne(UserProfile)`.
    - `assignedNutritionist()` → `belongsTo(User, 'assigned_nutritionist_id')`.
    - `clients()` → `hasMany(User, 'assigned_nutritionist_id')` (cuando el usuario es nutricionista).
  - Trait `HasRoles` (Spatie) para roles y permisos.

- `Assessment`
  - Campos: `user_id`, `weight`, `height`, `age`, `gender`, `activity_level`, `bmi`, `geb`, `get`, `caloric_balance`, timestamps.
  - Relaciones:
    - `user()` → `belongsTo(User)`.
    - `recommendations()` → `hasMany(Recommendation)`.
    - `nutritionistNotes()` → `hasMany(NutritionistNote)`.

- `Recommendation`
  - Campos: `assessment_id`, `type` (`nutrition` | `exercise`), `content`, timestamps.
  - Relaciones:
    - `assessment()` → `belongsTo(Assessment)`.

- `NutritionistNote`
  - Campos: `assessment_id`, `nutritionist_id`, `note`, timestamps.
  - Relaciones:
    - `assessment()` → `belongsTo(Assessment)`.
    - `nutritionist()` → `belongsTo(User, 'nutritionist_id')`.

- `UserProfile`
  - Campos:
    - `user_id`
    - `phone`
    - `birth_date`
    - `photo` (URL)
    - `preferences` (array serializado en JSON)
    - `allergies` (array serializado en JSON)
    - `goal` (`lose_weight`, `gain_weight`, `maintain`, `gain_muscle`)
    - `goal_description` (texto libre)
    - `target_weight` (kg)
    - `target_bmi`
    - `activity_goal_minutes` (minutos/semana)
    - `experience_level` (`beginner`, `intermediate`, `advanced`)
    - `notes` (nota que el usuario dirige a su nutricionista)
  - Relaciones:
    - `user()` → `belongsTo(User)`.

#### 3.2 Controladores Clave

- `AuthController` (API)
  - `register()`:
    - Crea usuario con `name`, `email`, `password`.
    - Asigna rol `user`.
    - Retorna `user` + `roles` + `permissions` + token.
  - `login()`:
    - Valida credenciales.
    - Genera token y devuelve `user` + `roles` + `permissions`.
  - `logout()`:
    - Elimina el token actual.
  - `user()`:
    - Devuelve el usuario autenticado + roles + permisos.

- `AssessmentController` (usuario)
  - Lógica de negocio central:
    - `calculateBMI(weight, height)`.
    - `calculateGEB(weight, height, age, gender)` (Harris‑Benedict).
    - `calculateGET(geb, activity_level)` (multiplicadores por nivel de actividad).
    - `calculateCaloricBalance(get, daily_intake)` (balance calórico, por defecto 0 si no se indica).
  - `store()`:
    - Valida datos de valoración.
    - Calcula IMC, GEB, GET, balance calórico.
    - Crea `Assessment`.
    - Genera recomendaciones (`generateRecommendations()`):
      - En función del IMC (bajo peso, normal, sobrepeso, obesidad).
      - En función del nivel de actividad (sedentario, etc.).
    - Devuelve `assessment` + `recommendations`.
  - `index()`:
    - Devuelve todas las valoraciones del usuario autenticado (con recomendaciones).
  - `show()`:
    - Devuelve una valoración concreta del usuario autenticado.

- `RecommendationController`
  - `index(assessmentId)` → todas las recomendaciones de una valoración.
  - `byType(assessmentId, type)` → recomendaciones filtradas por tipo.

- `Api\Admin\UserController`
  - `index(Request)`:
    - Lista usuarios con:
      - `with('roles', 'assessments', 'assignedNutritionist')`.
      - Búsqueda por nombre/email.
      - Filtro `role` (para separar usuarios/nutricionistas).
      - Paginación.
    - Para nutricionistas (no super_admin): restringe a usuarios con `assigned_nutritionist_id = nutricionista actual`.
  - `show(Request, id)`:
    - Carga usuario con:
      - `roles`, `permissions`, `assessments (últimas 10)`, `assignedNutritionist`, `profile`.
    - Si el request viene de un nutricionista, asegura que el usuario pertenece a ese nutricionista.
    - Devuelve:
      - `user` + `roles` + `permissions` + `stats` (`total_assessments`, `latest_assessment`).
  - `update()`:
    - Permite modificar `name`, `email`, `password`, `roles`.
    - Solo `super_admin` puede asignar `assigned_nutritionist_id`.
    - Nunca se asigna nutricionista a usuarios `super_admin` ni `nutritionist`.
  - `assignRoles()`:
    - Sincroniza roles de un usuario.
  - `getRoles()`:
    - Devuelve todos los nombres de roles (excepto el rol eliminado `premium`).

- `Api\Admin\AssessmentController`
  - Gestión de valoraciones para admin:
    - Listado con filtros (usuario, rango IMC, fechas).
    - Detalle, actualización y borrado de valoraciones (según permisos).

- `Api\Admin\DashboardController`
  - `index()` (dashboard super admin):
    - Métricas globales de usuarios:
      - Total, activos últimos 30 días, nuevos hoy/semana/mes.
    - Métricas globales de valoraciones:
      - Total, hoy, esta semana, este mes.
    - Distribución de IMC (bajo peso, normal, sobrepeso, obesidad).
    - Promedios de IMC, GEB, GET.
    - Valoraciones recientes.
    - Crecimiento diario últimos 30 días (usuarios y valoraciones).
    - **Estadísticas por nutricionista**:
      - Para cada nutricionista:
        - `clients_count`
        - `notes_count` (anotaciones del nutricionista)
        - `recommendations_count` (recomendaciones en valoraciones de sus clientes)
        - `engagement_score = notes_count + recommendations_count`
      - Ordenados por `engagement_score` descendente.
  - `nutritionist()` (dashboard nutricionista):
    - Calcula métricas solo sobre sus propios clientes:
      - `users.total` (número de clientes).
      - `assessments.total` y `assessments.this_month`.
      - `recent_assessments` (últimas 10).

- `Api\Nutritionist\NoteController`
  - `index(request, assessmentId)`:
    - Nutricionista: solo puede ver notas de valoraciones de **sus clientes**.
    - Usuario: solo puede ver notas de **sus propias** valoraciones.
  - `byUser(request, userId)`:
    - Nutricionista: solo puede ver notas de usuarios asignados a él.
  - `store(request, assessmentId)`:
    - Solo nutricionista.
    - Solo en valoraciones de sus clientes.
  - `update()` y `destroy()`:
    - Sólo puede editar/borrar sus **propias** notas (`nutritionist_id`).

- `Api\UserProfileController`
  - `show()`:
    - Devuelve (o crea si no existe) el `UserProfile` del usuario autenticado.
  - `update()`:
    - Valida y actualiza todos los campos del perfil (datos personales, preferencias, alergias, objetivos, notas).

#### 3.3 Rutas API (resumen)

- Públicas:
  - `POST /api/register`
  - `POST /api/login`

- Protegidas (`auth:sanctum`):
  - Auth:
    - `POST /api/logout`
    - `GET /api/user`
  - Perfil:
    - `GET /api/user/profile`
    - `PUT /api/user/profile`
  - Usuario (valoraciones):
    - `apiResource('assessments', AssessmentController)`
    - `GET /api/assessments/{id}/recommendations`
    - `GET /api/assessments/{assessmentId}/recommendations/{type}`
    - `GET /api/assessments/{assessmentId}/notes` (usuario ve sus propias notas)
  - Admin (`/api/admin/...`):
    - Dashboard: `/dashboard`, `/dashboard/nutritionist`.
    - Usuarios: `GET/POST/PUT/DELETE /users`, `POST /users/{id}/roles`, `GET /users/roles/all`.
    - Valoraciones: `GET /assessments`, `/assessments/statistics`, `/assessments/{id}`, `PUT/DELETE /assessments/{id}`.
  - Nutricionista (`/api/nutritionist/...`):
    - Notas: `GET /assessments/{id}/notes`, `GET /users/{id}/notes`, `POST/PUT/DELETE` sobre notas (con permisos).

---

### 4. Frontend (React)

#### 4.1 Estructura General

Componentes principales:
- `App.jsx`:
  - Maneja autenticación en memoria (`user` + `token` en `localStorage`).
  - Define rutas:
    - `/login`, `/register`
    - `/dashboard` (usuario)
    - `/profile` (perfil)
    - `/assessment` (nueva valoración)
    - `/history` (historial)
    - `/admin/...` (panel admin, anidado)
    - `/nutritionist/...` (panel nutricionista, anidado)
    - `/` → redirección a `/dashboard` o `/login`.

- `Dashboard.jsx`:
  - Navbar con:
    - Logo FitBalance.
    - Botón `Perfil`.
    - Chip de usuario con:
      - Foto (`profile.photo`) si existe.
      - Inicial del nombre en caso contrario.
    - Botones de acceso al `Panel Admin` y `Panel Nutricionista` según rol.
    - Botón `Cerrar sesión`.
  - Sección hero con bienvenida y descripción.
  - Tarjetas de acción:
    - “Nueva Valoración” → `/assessment`.
    - “Historial” → `/history`.
  - Tarjetas informativas `¿Qué es FitBalance?` (IMC, GEB, GET).
  - Bloque “Perfil”:
    - Botón “Ir a mi perfil”.
    - Resumen simple de progreso (si hay objetivo de peso y última valoración).

- `Profile.jsx`:
  - Pantalla completa para gestionar el perfil de usuario.
  - Secciones:
    - **Datos personales**: teléfono, fecha de nacimiento, foto (URL) con vista previa en círculo.
    - **Preferencias y alergias**:
      - Preferencias: lista de “chips” (p. ej. `vegetariano`, `sin lactosa`).
      - Alergias: lista de “chips” (p. ej. `maní`, `mariscos`).
      - Añadir tipo “escribir y Enter” y eliminar con `×`.
    - **Objetivo y nivel**:
      - Select `goal` (perder peso, ganar peso, mantener, ganar músculo).
      - Select `experience_level` (principiante/intermedio/avanzado).
      - `goal_description` (texto libre tipo “bajar 5 kg en 3 meses”).
    - **Objetivos numéricos**:
      - `target_weight` (peso objetivo).
      - `target_bmi`.
      - `activity_goal_minutes` (minutos/semana).
    - **Notas**:
      - `notes`: campo de texto largo; es la **nota que el usuario dirige a su nutricionista**.
  - Columna lateral “Progreso”:
    - Muestra último peso vs peso objetivo, si existen ambos.

- `AssessmentForm.jsx`:
  - Formulario para crear valoraciones:
    - Peso, estatura, edad, género, nivel de actividad, etc.
  - Tras enviar:
    - Llama a `/api/assessments`.
    - Muestra los resultados (IMC, GEB, GET, balance calórico).
    - Muestra recomendaciones nutricionales y de ejercicio generadas por el backend.

- `AssessmentHistory.jsx`:
  - Lista las valoraciones del usuario autenticado.
  - Incluye:
    - **Gráfica de evolución** (recharts) con IMC, peso y GET por fecha.
    - Tarjetas con resumen de cada valoración.
    - Vista detallada de una valoración (cuando se selecciona):
      - IMC, GEB, GET, balance calórico.
      - Datos de valoración.
      - Recomendaciones nutricionales y de ejercicio.
      - `AssessmentNotesView` con las anotaciones del nutricionista (solo lectura para el usuario).

- `admin/AdminLayout.jsx`:
  - Layout con sidebar y topbar para el panel admin.
  - Menú lateral:
    - Dashboard.
    - Usuarios.
    - Valoraciones.
  - Info de usuario admin en el pie del sidebar (nombre/email) + botones “Usuario” (volver a dashboard de usuario) y “Salir”.

- `admin/AdminDashboard.jsx`:
  - Tarjetas de métricas globales:
    - Total usuarios, usuarios activos, total valoraciones, valoraciones hoy.
  - Distribución de IMC (barras simples).
  - Promedios de IMC, GEB, GET.
  - Valoraciones recientes.
  - **Sección “Estadísticas por Nutricionista”**:
    - Tabla resumen con clientes, anotaciones, recomendaciones y engagement.
    - Gráficas con `recharts`:
      - Barras: clientes/anotaciones/recomendaciones por nutricionista.
      - Pie: distribución de clientes por nutricionista.
      - Barras horizontales: ranking por engagement.

- `admin/AdminUsers.jsx`:
  - Gestión de usuarios (super_admin/admin):
    - Búsqueda por nombre/email.
    - Filtro por tipo: Todos / Usuarios (clientes) / Nutricionistas.
    - Tabla con:
      - Nombre, email, roles, cantidad de valoraciones, fecha de registro.
    - Columna “Nutricionista asignado” (solo visible para `super_admin`):
      - Select con lista de nutricionistas.
      - Solo se habilita para usuarios que **no** son `super_admin` ni `nutritionist`.
    - Botones “Ver” (detalle) y “Eliminar”.

- `admin/AdminUserDetails.jsx`:
  - Detalle de usuario con:
    - Datos básicos.
    - Roles y colores asociados.
    - Bloque de asignación de nutricionista (solo super_admin, y solo si el usuario no es super_admin ni nutricionista).
    - Estadísticas: total valoraciones, fecha de registro, última actividad.
    - Última valoración.
    - Historial de valoraciones recientes.
    - Gestor de roles (via `RoleManager`).

- `nutritionist/NutritionistLayout.jsx`:
  - Layout del panel de nutricionista:
    - Menú lateral: Dashboard, Mis Clientes, Valoraciones.
    - Pie del sidebar con datos del nutricionista + acceso a “Usuario” (dashboard general) y botón Salir.

- `nutritionist/NutritionistDashboard.jsx`:
  - Muestra métricas sobre los clientes de ese nutricionista:
    - Número total de clientes.
    - Total de valoraciones y valoraciones del mes.
    - Valoraciones recientes (de sus clientes).

- `nutritionist/NutritionistUsers.jsx`:
  - Listado de clientes del nutricionista autenticado.
  - Usa `GET /admin/users` con filtro por nutricionista en backend.

- `nutritionist/NutritionistUserDetails.jsx`:
  - Detalle de un cliente desde la perspectiva del nutricionista:
    - Avatar grande que usa `user.profile.photo` (o inicial si no hay foto).
    - Datos básicos (nombre, email).
    - Bloque “Nota del usuario para su nutricionista” si `profile.notes` está lleno.
    - Estadísticas de valoraciones.
    - Gráfica de evolución (IMC, peso, GET) del cliente.
    - Última valoración.
    - Lista de valoraciones con sus anotaciones (`AssessmentNotes`).

---

### 5. Aislamiento por Nutricionista (Multi‑Tenancy Lógico)

Requisitos cumplidos:
- Cada nutricionista:
  - Solo ve **sus propios clientes**.
  - Solo ve las **valoraciones** de sus clientes.
  - Solo puede crear/editar **notas** sobre valoraciones de sus clientes.
- `super_admin`:
  - Ve todos los usuarios, valoraciones y estadísticas.
- `admin`:
  - Ve todos los usuarios y valoraciones, pero sin funciones críticas de configuración.

Implementación:
- Backend:
  - Filtros en `Admin\UserController@index` y `Admin\AssessmentController` para restringir datos cuando el usuario autenticado tiene rol `nutritionist`.
  - Verificaciones en `NoteController` (nutritionist) para asegurar que:
    - El assessment pertenece a un usuario con `assigned_nutritionist_id = nutricionista actual`.
  - Asignación de nutricionista a clientes gestionada únicamente por `super_admin`.

---

### 6. Objetivos y Seguimiento de Progreso

Funcionalidades implementadas:
- El usuario puede:
  - Definir un **peso objetivo** y un **IMC objetivo**.
  - Definir un objetivo de **actividad semanal (min/semana)**.
  - Especificar un objetivo general (enum: perder peso, ganar peso, mantener, ganar músculo) y una descripción libre.
- El sistema:
  - En el Dashboard muestra un resumen simple (último peso vs peso objetivo).
  - En `Perfil` muestra una tarjeta “Progreso” con la diferencia en kg.
  - Para nutricionistas, la vista de cliente incluye la evolución y notas del usuario, ayudando a contextualizar el objetivo del cliente.

---

### 7. Notas del Usuario para el Nutricionista

- El campo `UserProfile.notes` está pensado como un **canal unidireccional** donde el usuario deja mensajes relevantes para su nutricionista (gustos, restricciones, contexto personal, etc.).
- Se muestra:
  - En la pantalla `Perfil` (usuario) como textarea editable.
  - En `NutritionistUserDetails` (nutricionista) como un bloque destacado “Nota del usuario para su nutricionista”.

Esto refuerza la comunicación y el contexto sin exponer esa nota a otros usuarios.

---

### 8. UX y Diseño

Principios aplicados:
- Diseño consistente con TailwindCSS, tarjetas con bordes redondeados y sombras suaves.
- Paleta de colores basada en azules, morados y acentos verdes/naranjas.
- Uso de iconos de `lucide-react` para reforzar visualmente secciones clave (IMC, GEB, GET, dashboard, etc.).
- Feedback visual:
  - Estados de carga (“Cargando…”).
  - Mensajes de error y éxito en formularios (perfil, notas, etc.).
  - Botones con estados hover/active y sombras para sensación de “clic”.

---

### 9. Puesta en Marcha (Setup Básico)

#### 9.1 Backend

1. Instalar dependencias:
   ```bash
   cd backend
   composer install
   ```
2. Configurar `.env` con conexión a MySQL y claves:
   - Base de datos `fitbalance`.
   - Usuario/contraseña según tu entorno.
3. Ejecutar migraciones y seeders:
   ```bash
   php artisan migrate
   php artisan db:seed --class=RolePermissionSeeder
   ```
4. Usuario `super_admin` (definido en el seeder):
   - Email: `admin@fitbalance.com`
   - Password: `admin123456`

#### 9.2 Frontend

1. Instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```
2. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en el navegador la URL que muestra Vite (normalmente `http://localhost:5173`).

---

### 10. Posibles Mejores Futuras

Aunque el proyecto ya está muy completo, algunas ideas de evolución:
- Extender las **gráficas de progreso** (por ejemplo, más métricas o periodos seleccionables).
- Añadir **sección de clientes prioritarios** en el dashboard de nutricionista (IMC altos, más tiempo sin valoración, etc.).
- Exportación de datos a CSV/Excel (para informes externos).
- Notificaciones (email o in‑app) para:
  - Nuevas notas de nutricionista.
  - Recordatorios de nuevas valoraciones.
- Sistemas de mensajería básica entre usuario y nutricionista (con control de permisos).

---

### 11. Conclusión

FitBalance se encuentra en un estado funcionalmente sólido:
- Flujo de valoración completo con cálculo de IMC, GEB, GET y recomendaciones automáticas.
- Gestión de usuarios multi‑rol con aislamiento claro para nutricionistas.
- Paneles específicos para super admin, admin, nutricionista y usuario final.
- Mecanismo de perfil con objetivos, preferencias, alergias y notas, integrado con la experiencia de nutricionista.

El proyecto está listo para pruebas de usuario y para seguir iterando en funcionalidades de mayor valor añadido (priorización de clientes, notificaciones, análisis avanzado).

