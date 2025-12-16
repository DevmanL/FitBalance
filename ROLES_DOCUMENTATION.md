# Documentación de Roles - FitBalance

## Resumen

FitBalance utiliza un sistema de roles y permisos basado en Spatie Laravel Permission. Todos los nuevos usuarios se registran automáticamente con el rol **"user"** (funcionalidades básicas).

---

## Roles Disponibles

### 1. **Super Admin** (`super_admin`)

**Función Principal:** Control total del sistema

**Permisos:**
- ✅ Todos los permisos del sistema
- ✅ Gestión completa de usuarios (crear, editar, eliminar)
- ✅ Gestión de roles y permisos
- ✅ Configuración del sistema
- ✅ Acceso a todas las valoraciones
- ✅ Gestión de contenido
- ✅ Analytics completos
- ✅ Generación de reportes
- ✅ Configuración de permisos

**Uso:** Administrador principal del sistema con acceso ilimitado.

---

### 2. **Admin** (`admin`)

**Función Principal:** Gestión de usuarios y contenido

**Permisos:**
- ✅ Ver, crear, editar y eliminar usuarios
- ✅ Ver todas las valoraciones
- ✅ Gestionar valoraciones (editar, eliminar)
- ✅ Gestionar recomendaciones
- ✅ Ver analytics completos
- ✅ Generar y exportar reportes
- ✅ Gestionar contenido del sistema
- ✅ Gestionar configuraciones (excepto críticas)
- ❌ No puede modificar configuraciones críticas del sistema
- ❌ No puede gestionar roles y permisos directamente

**Uso:** Administrador que gestiona el día a día del sistema sin acceso a configuraciones críticas.

---

### 3. **Nutritionist** (`nutritionist`)

**Función Principal:** Gestión de valoraciones y seguimiento de clientes

**Permisos:**
- ✅ Ver todos los usuarios del sistema
- ✅ Ver todas las valoraciones
- ✅ Crear y editar valoraciones
- ✅ Ver, crear y editar recomendaciones
- ✅ Agregar anotaciones personalizadas a valoraciones
- ✅ Ver analytics básicos
- ✅ Acceso al panel de nutricionista
- ❌ No puede eliminar valoraciones
- ❌ No puede crear, editar o eliminar usuarios
- ❌ No puede asignar roles

**Uso:** Nutricionista o entrenador que gestiona las valoraciones de los clientes y proporciona seguimiento personalizado.

**Panel Especial:** Tiene acceso a `/nutritionist/dashboard` con funcionalidades específicas para nutricionistas.

---

### 4. **User** (`user`) - **ROL POR DEFECTO**

**Función Principal:** Funcionalidades básicas (asignado automáticamente al registrarse)

**Permisos:**
- ✅ Crear valoraciones morfofuncionales
- ✅ Ver sus propias valoraciones y resultados
- ✅ Ver recomendaciones automáticas generadas
- ✅ Ver anotaciones de su nutricionista (solo lectura)
- ❌ No puede ver valoraciones de otros usuarios
- ❌ No puede crear recomendaciones
- ❌ No puede gestionar usuarios
- ❌ No puede ver analytics

**Uso:** Usuario estándar que utiliza la aplicación para realizar valoraciones y recibir recomendaciones.

**Nota Importante:** Todos los nuevos usuarios se registran automáticamente con este rol. Un administrador puede cambiar el rol si es necesario.

---

## Flujo de Registro

1. Usuario se registra en la aplicación
2. Sistema crea la cuenta con el rol **"user"** automáticamente
3. Usuario puede realizar valoraciones y ver sus resultados
4. Un administrador puede asignar roles adicionales si es necesario

---

## Asignación de Roles

Los roles pueden ser asignados o modificados por usuarios con permisos de administración:

- **Super Admin:** Puede asignar cualquier rol
- **Admin:** Puede asignar roles (excepto super_admin en algunos casos)

Los roles se gestionan desde el panel administrativo en la sección de detalles de usuario.

---

## Permisos Específicos

### Permisos de Usuarios
- `users.view` - Ver usuarios
- `users.create` - Crear usuarios
- `users.edit` - Editar usuarios
- `users.delete` - Eliminar usuarios
- `users.manage_roles` - Gestionar roles de usuarios

### Permisos de Valoraciones
- `assessments.view` - Ver propias valoraciones
- `assessments.view_all` - Ver todas las valoraciones
- `assessments.create` - Crear valoraciones
- `assessments.edit` - Editar valoraciones
- `assessments.delete` - Eliminar valoraciones
- `assessments.manage` - Gestión completa de valoraciones

### Permisos de Recomendaciones
- `recommendations.view` - Ver recomendaciones
- `recommendations.create` - Crear recomendaciones
- `recommendations.edit` - Editar recomendaciones
- `recommendations.delete` - Eliminar recomendaciones
- `recommendations.manage` - Gestión completa
- `recommendations.approve` - Aprobar recomendaciones

### Permisos de Analytics
- `analytics.view` - Ver analytics básicos
- `analytics.view_all` - Ver analytics completos

### Otros Permisos
- `reports.generate` - Generar reportes
- `reports.export` - Exportar reportes
- `settings.view` - Ver configuraciones
- `settings.manage` - Gestionar configuraciones
- `system.configure` - Configurar sistema
- `content.view` - Ver contenido
- `content.create` - Crear contenido
- `content.edit` - Editar contenido
- `content.delete` - Eliminar contenido
- `content.manage` - Gestión completa de contenido

---

## Panel de Nutricionista

Los usuarios con rol `nutritionist` tienen acceso a un panel especial en `/nutritionist/dashboard` que incluye:

- Dashboard con estadísticas
- Lista de todos los clientes (usuarios)
- Visualización de todas las valoraciones
- Capacidad de agregar anotaciones personalizadas a cada valoración
- Ver detalles completos de cada cliente

---

## Seguridad

- Los permisos se verifican en cada solicitud API
- Los usuarios solo pueden acceder a recursos para los que tienen permisos
- Las rutas están protegidas por middleware de permisos
- Los usuarios solo pueden ver y gestionar sus propios datos (a menos que tengan permisos especiales)

---

## Notas Adicionales

- Un usuario puede tener múltiples roles simultáneamente
- Los permisos se heredan de todos los roles asignados
- El rol "user" es el mínimo necesario para usar la aplicación
- Los roles pueden ser modificados en cualquier momento por un administrador

