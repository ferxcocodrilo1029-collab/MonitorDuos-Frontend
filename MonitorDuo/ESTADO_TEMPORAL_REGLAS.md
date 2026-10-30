# Estado temporal de reglas del frontend

Revisión del proyecto MonitorDuo tras la actividad de conexión con el backend (Issue #2).

| Regla | Cumplida | No cumplida | Observaciones |
|---|:---:|:---:|---|
| La URL del backend se configura por variable de entorno y se consume desde servicios. | X |  | Configurada vía `VITE_API_URL` en `.env.example` / `.env` y consumida por `api.js`. |
| Los datos del equipo monitoreado provienen del backend. | X |  | Se consultan a través de `monitorService.js` con datos reales del script Python y la BD. |
| Los componentes no realizan peticiones HTTP directamente; se usa la carpeta de servicios. | X |  | Toda petición HTTP pasa por `src/services/api.js`, `authService.js` y `monitorService.js`. |
| `App.jsx` no concentra la lógica del proyecto. | X |  | Declara las rutas y delega el estado de autenticación a `AuthContext`. |
| Los estados de carga y error se muestran en pantalla. | X |  | El login muestra 'Conectando...', deshabilita el botón y presenta mensajes diferenciados para 401 y falta de conexión. |
| No se usan datos simulados o de ejemplo escritos en el código. | X |  | Las credenciales simuladas fueron eliminadas y las métricas provienen del backend. |
| Las peticiones automáticas se detienen al desmontar el componente. | X |  | El intervalo y `AbortController` de sondeo en vivo se limpian al desmontar `HomePage`. |
| `.gitignore` excluye `node_modules`. | X |  | La carpeta `node_modules` y `.env` están ignorados. |
| No hay usuarios, contraseñas ni credenciales escritas en el código. | X |  | Se eliminaron `LOCAL_USERNAME` y `LOCAL_PASSWORD` de `Login.jsx`. |
| Cerrar sesión limpia la información del usuario y redirige al login. | X |  | Se llama a `logout()` en el backend, se limpia la sesión y se redirige a `/`. |

## Manejo de errores

| Error o situación | Estado | Situación actual |
|---|---|---|
| El Backend no está disponible. | Sí | Se detecta y muestra "No se pudo conectar con el servidor" en login y alertas de desconexión en el panel. |
| La sesión expiró o no existe. | Sí | `AuthContext` y `ProtectedRoute` consultan `perfil()` al backend y redirigen a `/` en 401. |
| El usuario no tiene permiso para consultar la información solicitada. | Parcial | Se bloquea el acceso general si no hay sesión iniciada; roles multi-host pendientes de backend. |
| No existen datos para mostrar. | Sí | El histórico maneja el mensaje "No se encontraron registros en el rango de fechas seleccionado." |
| Los datos capturados en un formulario no son válidos. | Sí | Se validan rangos de fechas, umbrales y campos obligatorios de login. |
| La petición tarda más tiempo del esperado. | Sí | `api.js` implementa tiempo límite por `AbortController` (10 segundos por defecto). |

## Funcionalidades y partes pendientes (Trabajo Futuro)

A continuación se detallan las partes que faltan por implementar o que se encuentran parcialmente cubiertas tras la integración inicial con el backend (Issue #2):

1. **Control de permisos y roles Multi-Host (Admin / Viewer)**
   - **Situación actual:** Se protege el acceso a las rutas `/home` y `/alerts` validando la sesión contra `index.php?action=profile`. Si no hay sesión válida (HTTP 401), se redirige a `/`.
   - **Parte faltante:** El backend aún no expone el rol del usuario autenticado ni la lista de hosts autorizados para cada cuenta. Cuando el backend implemente esta respuesta, el frontend deberá consultar el listado de hosts permitidos y habilitar un selector dinámico de equipos monitoreados según el rol (`Admin` para todos los hosts, `Viewer` para hosts asignados).

2. **Persistencia de umbrales y alertas en la Base de Datos**
   - **Situación actual:** La gestión de umbrales en `AlertsPage` opera de forma local almacenando los datos en `localStorage` a través de `thresholdStorage.js`.
   - **Parte faltante:** Se requiere que el backend provea endpoints REST para el CRUD de umbrales en la base de datos MySQL, permitiendo sincronizar las reglas de alerta entre diferentes navegadores y registrar las incidencias disparadas en el servidor.

3. **Generación y descarga de reportes TXT / CSV**
   - **Situación actual:** La pestaña de Histórico en `HomePage` permite filtrar y visualizar las métricas almacenadas en la base de datos por rango de fechas.
   - **Parte faltante:** Incorporar un botón de descarga para exportar un reporte resumido en formato TXT o CSV con los promedios y picos de consumo de CPU, memoria y disco en el rango seleccionado.

4. **Alertas en tiempo real y optimización de sondeo**
   - **Situación actual:** El monitoreo en vivo utiliza sondeo periódico (*polling*) cada 10 segundos contra el endpoint `index.php?action=metrics`.
   - **Parte faltante:** Notificaciones visuales emergentes (toasts/banners) al sobrepasar umbrales críticos y evaluación de Server-Sent Events (SSE) o WebSockets para evitar peticiones HTTP recurrentes.
