
# INV-Control: Sistema de Inventario y Activos Fijos (Unidad 1)

Este repositorio contiene el código fuente del sistema de gestión de inventario y préstamos para el SLEP Los Libertadores. 

**Nota de Arquitectura (Unidad 1):** Para cumplir con las restricciones del proyecto, esta iteración opera de forma nativa (sin contenedores Docker). El aislamiento físico de las bases de datos (*on-premise*) se simula mediante la creación de múltiples bases de datos locales en un único motor PostgreSQL.

---

## Prerrequisitos

Antes de instalar, asegúrate de tener instalado en tu sistema:
*   **Node.js** (v18.0 o superior)
*   **PostgreSQL** (Motor de base de datos)
*   **pgAdmin** o cualquier cliente SQL (opcional, pero recomendado)

---

## Paso 1: Configuración de la Base de Datos (Simulación On-Premise)

El sistema requiere bases de datos segregadas para cada establecimiento.

1. Abre tu cliente de PostgreSQL (ej. pgAdmin).
2. Conéctate a tu servidor local (`localhost` puerto `5432`).
3. Crea las siguientes bases de datos vacías:
   *   `db_quilicura`
   *   `db_conchali`

---

## Paso 2: Configuración del Backend

Abre una terminal, navega a la carpeta del backend y configura el entorno:

```
bash
cd backend
npm install

```

### Variables de Entorno

Crea un archivo `.env` en la raíz de la carpeta `backend` copiando el formato de `.env.example`. Asegúrate de que las credenciales apunten a tu instalación local de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_local
# Las URLs de conexión a las bases creadas en el Paso 1
DATABASE_URL_QUILICURA="postgresql://postgres:tu_contraseña_local@localhost:5432/db_quilicura"
DATABASE_URL_CONCHALI="postgresql://postgres:tu_contraseña_local@localhost:5432/db_conchali"

```

### Inicializar la Base de Datos

Ejecuta las migraciones o el script de creación de tablas para poblar la estructura en tus bases de datos locales:

```bash
npx sequelize-cli db:migrate

```

### Levantar el Servidor

```bash
npm run dev

```

El backend quedará escuchando en `http://localhost:3000`.

---

## Paso 3: Configuración del Frontend

Abre una **nueva** pestaña en tu terminal (manteniendo el backend corriendo) y navega a la carpeta del frontend:

```bash
cd frontend
npm install

```

### Variables de Entorno (Frontend)

Crea un archivo `.env` en la raíz de la carpeta `frontend`:

```env
VITE_BACKEND_URL=http://localhost:3000

```

### Levantar la Interfaz

```bash
npm run dev

```

La aplicación web estará disponible en `http://localhost:5173`.

---

##  Solución de Problemas Comunes

* **Pantalla blanca o error de "lucide-react":** Asegúrate de haber ejecutado `npm install` estrictamente *dentro* de la carpeta `frontend`, no en la raíz del proyecto.
* **Error de conexión en el Backend:** Verifica que PostgreSQL esté corriendo en los servicios de Windows/Linux y que la contraseña en tu archivo `.env` sea la correcta.
