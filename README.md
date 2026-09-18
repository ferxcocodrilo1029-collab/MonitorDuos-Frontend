# MoniDuo

Sistema de monitoreo de CPU, memoria RAM y disco. El proyecto se organiza en tres repositorios independientes:

- `frontend`: interfaz React y layout del monitor.
- `backend`: API y autenticacion.
- `database`: esquema, migraciones y datos iniciales.

## Integrantes

- Jose Fernando Hernandez Mendoza
- Eduardo Pat Maldonado

## Requisitos

- Git
- Node.js 20 o superior
- npm
- PHP 8 o superior
- Python 3.10 o superior
- MySQL 8 o superior
- XAMPP, Docker u otro entorno para ejecutar los servicios del backend y la base de datos

## Repositorios

Reemplaza las URLs de ejemplo por las URLs reales de GitHub antes de compartir este README:

```text
FRONTEND_REPO=https://github.com/organizacion/monitorduo-frontend.git
BACKEND_REPO=https://github.com/organizacion/monitorduo-backend.git
DATABASE_REPO=https://github.com/organizacion/monitorduo-database.git
```

## Clonar el proyecto completo

```bash
mkdir monitorduo
cd monitorduo
git clone https://github.com/organizacion/monitorduo-frontend.git frontend
git clone https://github.com/organizacion/monitorduo-backend.git backend
git clone https://github.com/organizacion/monitorduo-database.git database
```

La carpeta `frontend` de este repositorio contiene la aplicacion Vite. Las carpetas `backend` y `database` se clonan como repositorios hermanos, no dentro de `src`.

## Levantar la base de datos

Consulta el README del repositorio `database` para conocer el motor, las migraciones y los datos iniciales. Como referencia para MySQL:

```bash
mysql -u root -p < database/schema.sql
```

## Levantar el backend

Consulta el README del repositorio `backend` para instalar sus dependencias y configurar el servidor. El backend debe quedar escuchando en la URL que usara el frontend, por ejemplo:

```text
http://localhost:8000
```

El backend debera habilitar CORS para el origen de Vite:

```text
http://localhost:5173
```

## Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestre Vite, normalmente `http://localhost:5173`.

## Estado actual del frontend

Esta primera entrega porta solamente el layout de `Fernando/Monitor`:

- Pantalla de inicio de sesion.
- Panel principal.
- Selector de servidor.
- Pestanas de monitoreo en vivo e historico.
- Tarjetas y espacios reservados para las graficas.
- Filtros de fechas y estadisticas del historico.

El frontend todavia no tiene estilos visuales, autenticacion, llamadas HTTP, graficas reales ni conexiones con backend o database. Los valores se muestran como `--` y los formularios solo permiten probar la navegacion del layout.

## Integracion posterior

Cuando exista el backend, se puede reservar la URL mediante una variable de entorno en `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

La integracion debera implementarse despues en una capa de servicios, sin colocar credenciales ni consultas SQL en el frontend.

## Comandos disponibles

Desde `frontend/`:

```bash
npm run dev       # servidor de desarrollo
npm run build     # compilacion de produccion
npm run lint      # revision estatica
npm run preview   # previsualizacion de la compilacion
```

## Orden recomendado de arranque

1. Iniciar MySQL y aplicar las migraciones del repositorio `database`.
2. Iniciar el backend y comprobar su URL.
3. Iniciar Vite desde el repositorio `frontend`.
4. Configurar las llamadas API y autenticacion cuando el contrato del backend este definido.
