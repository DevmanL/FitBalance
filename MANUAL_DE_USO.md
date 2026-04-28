# Manual de Uso Completo - FitBalance

## 1. Introduccion

FitBalance es una plataforma web para:
- Realizar valoraciones morfofuncionales.
- Generar recomendaciones nutricionales y de ejercicio.
- Gestionar clientes por nutricionista.
- Administrar usuarios, roles y estadisticas del sistema.

Este manual explica el uso completo de la aplicacion segun cada rol:
- Usuario
- Nutricionista
- Admin
- Super Admin

---

## 2. Acceso al Sistema

### 2.1 Registro
1. Ingresa a la pantalla de registro.
2. Completa:
   - Nombre
   - Correo
   - Contrasena
   - Confirmacion de contrasena
3. Al registrarte, el sistema asigna el rol **user** por defecto.

### 2.2 Inicio de sesion
1. Ve a la pantalla de login.
2. Ingresa correo y contrasena.
3. Si los datos son correctos, entraras al dashboard principal.

### 2.3 Cierre de sesion
1. Desde la barra superior, presiona **Cerrar sesion**.
2. El sistema invalida el token actual y te redirige al login.

---

## 3. Navegacion General

En la interfaz principal puedes acceder a:
- **Perfil**
- **Nueva Valoracion**
- **Historial**
- **Panel Nutricionista** (si tienes rol nutritionist)
- **Panel Admin** (si tienes rol admin o super_admin)

---

## 4. Perfil de Usuario (Modulo Perfil)

Ruta: `/profile`

En esta pantalla puedes gestionar toda tu informacion personal y de seguimiento.

### 4.1 Datos personales
- Telefono
- Fecha de nacimiento
- Foto de perfil (URL)
  - Incluye vista previa.

### 4.2 Preferencias y alergias
- Se gestionan con chips (etiquetas):
  - Escribes el item y presionas Enter o coma para agregar.
  - Puedes eliminar cada chip con `x`.

### 4.3 Objetivo y nivel
- Objetivo principal:
  - Perder peso
  - Ganar peso
  - Mantener
  - Ganar musculo
- Nivel de experiencia:
  - Principiante
  - Intermedio
  - Avanzado
- Descripcion libre del objetivo (ej: "Bajar 5 kg en 3 meses").

### 4.4 Objetivos numericos
- Peso objetivo (kg)
- IMC objetivo
- Minutos de actividad por semana

### 4.5 Nota para nutricionista
- Campo **Notas**: mensaje del usuario dirigido a su nutricionista.
- Esta nota se muestra en la vista de detalle del cliente para el nutricionista.

### 4.6 Guardado
- Presiona **Guardar perfil** para persistir cambios.
- Veras confirmacion de guardado o mensaje de error.

---

## 5. Valoraciones (Usuario)

### 5.1 Crear nueva valoracion
Ruta: `/assessment`

1. Completa los datos solicitados:
   - Peso
   - Estatura
   - Edad
   - Genero
   - Nivel de actividad
   - (Opcional) ingesta diaria
2. Envia el formulario.
3. El sistema calcula:
   - IMC
   - GEB
   - GET
   - Balance calorico
4. Se generan recomendaciones automaticas de nutricion y ejercicio.

### 5.2 Historial de valoraciones
Ruta: `/history`

En esta pantalla puedes:
- Ver la lista de valoraciones anteriores.
- Ver grafica de evolucion.
- Abrir detalle completo de cada valoracion.
- Consultar recomendaciones y anotaciones del nutricionista.

#### Filtro de periodo en graficas
Las graficas de progreso permiten elegir:
- Todo el historial
- Ultimos 12 meses
- Ultimos 6 meses

---

## 6. Panel de Nutricionista

Ruta base: `/nutritionist`

Menu principal:
- Dashboard
- Mis Clientes
- Valoraciones

### 6.1 Reglas de acceso de datos
Un nutricionista solo puede ver:
- Sus clientes asignados.
- Valoraciones de sus clientes.
- Notas y datos relacionados con sus clientes.

No puede ver clientes de otros nutricionistas.

### 6.2 Dashboard de nutricionista
Muestra:
- Total de clientes asignados.
- Total de valoraciones de su cartera.
- Valoraciones del mes.
- Listado de valoraciones recientes.

### 6.3 Mis clientes
Lista de clientes asignados al nutricionista.

Para cada cliente se puede abrir:
- Datos generales.
- Evolucion (IMC, peso, GET) con periodos filtrables.
- Nota del usuario desde su perfil.
- Historial de valoraciones con anotaciones.

### 6.4 Anotaciones del nutricionista
Sobre cada valoracion de un cliente:
- Crear nota.
- Editar su propia nota.
- Eliminar su propia nota.

El usuario final puede ver estas anotaciones en modo lectura.

---

## 7. Panel Admin

Ruta base: `/admin`

Disponible para roles `admin` y `super_admin`.

Menu principal:
- Dashboard
- Usuarios
- Valoraciones

### 7.1 Dashboard Admin
Muestra estadisticas globales:
- Usuarios totales, activos y nuevos.
- Valoraciones totales, por dia/semana/mes.
- Distribucion de IMC.
- Promedios de IMC, GEB, GET.
- Valoraciones recientes.

### 7.2 Gestion de usuarios
Permite:
- Buscar por nombre o correo.
- Filtrar por tipo:
  - Todos
  - Usuarios (clientes)
  - Nutricionistas
- Ver detalle de usuario.
- Eliminar usuario (segun permisos).

#### Asignacion de nutricionista
Solo el **super_admin** puede asignar nutricionista a clientes.

Restricciones:
- No se asigna nutricionista a `super_admin`.
- No se asigna nutricionista a `nutritionist`.

### 7.3 Gestion de valoraciones
Permite:
- Buscar valoraciones por usuario.
- Ver IMC, GEB, GET, peso y fecha.
- Gestionar registros segun permisos del rol.

---

## 8. Super Admin (Funciones Especiales)

El super admin tiene acceso total y funciones adicionales:

### 8.1 Control global
- Gestion total de usuarios.
- Gestion de roles y permisos.
- Configuracion general.

### 8.2 Asignacion de clientes a nutricionistas
- Define que cliente pertenece a que nutricionista.
- Base del modelo de aislamiento por profesional.

### 8.3 Estadisticas por nutricionista
En el dashboard se visualiza:
- Clientes por nutricionista
- Cantidad de anotaciones
- Cantidad de recomendaciones
- Engagement (interaccion total)

Incluye graficas y tabla resumen.

---

## 9. Recomendaciones de Uso Operativo

### 9.1 Para usuarios
- Completa primero tu perfil.
- Define metas realistas (peso/IMC/actividad).
- Realiza valoraciones periodicas para comparar progreso.

### 9.2 Para nutricionistas
- Revisa diariamente valoraciones recientes.
- Usa anotaciones claras y accionables.
- Consulta notas del usuario para personalizar el seguimiento.

### 9.3 Para administradores
- Mantener asignaciones de clientes actualizadas.
- Revisar indicadores del dashboard para detectar cargas desbalanceadas.

---

## 10. Solucion de Problemas Frecuentes

### 10.1 No veo datos en dashboard
- Verifica rol y permisos del usuario.
- Comprueba que existan datos cargados (usuarios/valoraciones).

### 10.2 No puedo ver un cliente como nutricionista
- El cliente puede no estar asignado a ese nutricionista.
- Validar asignacion desde panel de usuarios (super_admin).

### 10.3 No se ve la foto de perfil
- Verifica que la URL sea publica y valida.
- Revisa que el perfil haya sido guardado correctamente.
- Recarga la vista para actualizar datos en navbar.

### 10.4 Error al guardar perfil
- Revisa formato y rangos de campos:
  - Peso objetivo, IMC objetivo, minutos de actividad.
- Verifica conexion con backend y base de datos.

---

## 11. Buenas Practicas de Seguridad

- No compartir cuentas entre usuarios.
- Usar contrasenas robustas.
- Cerrar sesion en equipos compartidos.
- Restringir el rol super admin a personal de maxima confianza.

---

## 12. Glosario Rapido

- **IMC:** Indice de Masa Corporal.
- **GEB:** Gasto Energetico Basal.
- **GET:** Gasto Energetico Total.
- **Balance calorico:** Diferencia entre ingesta y gasto total.
- **Engagement:** Indicador de interaccion del nutricionista con su cartera (anotaciones + recomendaciones).

---

## 13. Resumen Final

FitBalance permite operar el ciclo completo:
1. Captura de perfil y objetivos del usuario.
2. Valoracion morfofuncional con calculos automaticos.
3. Recomendaciones inmediatas.
4. Seguimiento longitudinal con graficas.
5. Intervencion profesional del nutricionista.
6. Gestion administrativa y analitica de alto nivel.

Con este flujo, la plataforma soporta tanto uso individual como gestion profesional y escalamiento por multiples nutricionistas.

