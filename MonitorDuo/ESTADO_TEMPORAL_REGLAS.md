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