# Estado temporal de reglas del frontend

Revisión del proyecto MonitorDuo al 2026-10-02. Este estado puede cambiar al integrar el backend.

| Regla | Cumplida | No cumplida | Observaciones |
|---|:---:|:---:|---|
| La URL del backend se configura por variable de entorno y se consume desde servicios. |  | X | Aún no existe conexión al backend ni configuración de URL de API. |
| Los datos del equipo monitoreado provienen del backend. |  | X | El panel usa un nombre de equipo de ejemplo, métricas estáticas y valores simulados. |
| Los componentes no realizan peticiones HTTP directamente; se usa la carpeta de servicios. | X |  | Todavía no hay peticiones HTTP implementadas. El servicio actual administra umbrales en `localStorage`. |
| `App.jsx` no concentra la lógica del proyecto. | X |  | Actualmente se limita a declarar las rutas de las páginas. |
| Los estados de carga y error se muestran en pantalla. |  | X | Se muestran errores de validación, pero no hay estados de carga ni errores de peticiones al backend. |
| No se usan datos simulados o de ejemplo escritos en el código. |  | X | Hay lecturas simuladas al 95% y umbrales predeterminados escritos en el código. |
| Las peticiones automáticas se detienen al desmontar el componente. |  |  | No aplica todavía: no hay peticiones automáticas implementadas. |
| `.gitignore` excluye `node_modules`. | X |  | La carpeta `node_modules` está ignorada. |
| No hay usuarios, contraseñas ni credenciales escritas en el código. |  | X | `Login.jsx` contiene credenciales locales fijas. |
| Cerrar sesión limpia la información del usuario y redirige al login. | X |  | Se elimina el usuario de `sessionStorage` y se navega a `/`. |

## Manejo de errores

| Error o situación | Estado | Situación actual |
|---|---|---|
| El Backend no está disponible. | Parcial | El panel muestra “Sin conexión al servidor”, pero es un estado fijo; todavía no detecta errores reales del Backend. |
| La sesión expiró o no existe. | No | Se guarda el nombre en `sessionStorage`, pero no se valida la sesión ni se protege la ruta del panel. |
| El usuario no tiene permiso para consultar la información solicitada. | No | Aún no existe autenticación con Backend ni control de permisos. |
| No existen datos para mostrar. | Parcial | Se muestran marcadores como `--` y textos pendientes de conexión; no se maneja una respuesta vacía del Backend. |
| Los datos capturados en un formulario no son válidos. | Parcial | Login y alertas muestran errores de validación; el formulario histórico todavía no valida ni consulta un rango. |
| La petición tarda más tiempo del esperado. | No | Todavía no hay peticiones HTTP ni control de tiempo de espera. |