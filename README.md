# MoniDuo - Frontend

Sistema de monitoreo de CPU, memoria RAM y disco. El proyecto se organiza en tres repositorios independientes:

- `frontend`: interfaz React + Vite y layout del monitor (`ferxcocodrilo1029-collab/MonitorDuos-Frontend`).
- `backend`: API REST en PHP 8 y scripts de métricas en Python (`eduardopat09/MonitorDuos-Backend`).
- `database`: esquema y migraciones en MySQL (`eduardopat09/MonitorDuos-BD`).

## Integrantes

- José Fernando Hernández Mendoza
- Eduardo Pat Maldonado

---

## Requisitos Previos

- Git
- Node.js 20 o superior
- npm
- PHP 8 o superior (para ejecutar el backend)
- Python 3.10 o superior con `psutil`
- MySQL 8 o superior

---

## Variables de Entorno

En la carpeta `MonitorDuo/` existe el archivo `.env.example`. Copia este archivo a `.env`:

```bash
cd MonitorDuo
cp .env.example .env
```

| Variable | Descripción | Valor por defecto / Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base donde se ejecuta el backend PHP | `http://localhost:8000` |

> **Nota:** Si se deja vacía la variable `VITE_API_URL`, el servidor de desarrollo de Vite utilizará el proxy configurado en `vite.config.js` (`/api` redirigido a `http://127.0.0.1:8000`).

---

## Instalación y Ejecución del Frontend

1. **Instalar dependencias:**
   ```bash
   cd MonitorDuo
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   El frontend estará disponible en: `http://localhost:5173/`

3. **Verificación de calidad (linter) y build:**
   ```bash
   npm run lint
   npm run build
   ```

---

## Cómo Levantar el Frontend contra el Backend

1. **Levantar el Backend (PHP):**
   En la raíz del repositorio de Backend:
   ```bash
   php -S 127.0.0.1:8000 -t backend
   ```
   O mediante Apache (XAMPP): `http://localhost/backend/index.php`.

2. **Configurar el Frontend:**
   Verifica que `MonitorDuo/.env` apunte a la URL del backend:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Iniciar el Frontend:**
   ```bash
   cd MonitorDuo
   npm run dev
   ```

4. **Flujo de Autenticación y Endpoints del Backend:**
   - **Login (`POST index.php?action=login`):** Envía `{ usuario, contrasena }`.
   - **Perfil / Validación de Sesión (`GET index.php?action=profile`):** Verifica la cookie de sesión (`PHPSESSID`). Si responde `401`, redirige automáticamente a `/`.
   - **Logout (`POST index.php?action=logout`):** Destruye la sesión activa y regresa al login.

---

## Estructura de Páginas del Frontend

Cada página del frontend se organiza dentro de su propia carpeta modular en `src/Pages/`:

```
MonitorDuo/src/
├── Pages/
│   ├── AlertsPage/
│   │   ├── AlertsPage.jsx
│   │   └── index.js
│   ├── HomePage/
│   │   ├── HomePage.jsx
│   │   └── index.js
│   └── Login/
│       ├── Login.jsx
│       └── index.js
├── context/
│   ├── AuthContext.jsx
│   ├── AuthContextInstance.js
│   └── useAuth.js
└── services/
    ├── api.js
    ├── authService.js
    ├── monitorService.js
    └── thresholdStorage.js
```

---

## Funcionalidades Pendientes y Trabajo Futuro (Próximos Issues)

Tras la resolución del Issue #2 (conexión de login, protección de rutas y consumo de métricas desde el backend), las siguientes partes quedan identificadas como trabajo pendiente para los próximos sprints/issues:

1. **Control de Permisos y Roles Multi-Host (Admin / Viewer):**
   - Actualmente el acceso está protegido globalmente mediante `ProtectedRoute` y la consulta a `index.php?action=profile`.
   - *Pendiente:* Cuando el backend envíe el rol del usuario y los hosts asociados en la sesión, el frontend implementará el selector dinámico de servidores y limitará la vista de equipos según los permisos (`admin` = todos los hosts; `viewer` = hosts asignados).

2. **Persistencia de Alertas y Umbrales en Base de Datos:**
   - La configuración de umbrales en `AlertsPage` opera de forma local con `localStorage` (`thresholdStorage.js`).
   - *Pendiente:* Desarrollar los endpoints en backend para almacenar, editar y eliminar umbrales en MySQL, así como el historial de alertas disparadas.

3. **Generación y Descarga de Reportes en TXT / CSV:**
   - En la vista de métricas históricas se pueden consultar los registros de la base de datos por rango de fechas.
   - *Pendiente:* Agregar la funcionalidad para descargar un reporte formateado (.txt o .csv) con el resumen estadístico de CPU, RAM y disco.

4. **Alertas en Tiempo Real:**
   - Las métricas se actualizan por sondeo periódico cada 10 segundos.
   - *Pendiente:* Integrar banners o notificaciones emergentes de umbrales sobrepasados y evaluar transporte en tiempo real (Server-Sent Events / WebSockets).

