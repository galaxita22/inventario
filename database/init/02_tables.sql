
-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'solicitante',
    rut VARCHAR(15) UNIQUE NOT NULL,
    matricula VARCHAR(50),
    escuela VARCHAR(100) NOT NULL,
    first_login BOOLEAN DEFAULT TRUE,
    avatar_ref VARCHAR(255)
);

-- Crear tabla de laboratorios si no existe
CREATE TABLE IF NOT EXISTS labs (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL UNIQUE,
	edificio VARCHAR(100) NOT NULL,
	"createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de componentes si no existe
CREATE TABLE IF NOT EXISTS componentes (
	id SERIAL PRIMARY KEY,
	sku VARCHAR(255) NOT NULL UNIQUE,
	lab_id INTEGER NOT NULL,
	familia VARCHAR(255) NOT NULL,
	modelo VARCHAR(255) NOT NULL,
	tipo VARCHAR(255) NOT NULL,
	cantidad INTEGER NOT NULL,
	codigo_utalca VARCHAR(255),
	numero_serial VARCHAR(255),
	imagen_ref VARCHAR(255),
	descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'disponible'
    CHECK (estado IN ('disponible', 'critico', 'agotado')),
    stock_critico INTEGER DEFAULT 5,
	"createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lab FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE,
    UNIQUE(sku)
);

CREATE TABLE IF NOT EXISTS prestamos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    codigo_peticion VARCHAR(255) UNIQUE,
    fecha_peticion DATE,
    fecha_retiro DATE,
    fecha_estimada_devolucion DATE,
    fecha_devolucion DATE,
    estado VARCHAR(50) 
        DEFAULT 'carrito'
        CHECK (estado IN ('carrito',
                         'pendiente',
                         'aprobado', 
                         'rechazado', 
                         'devuelto', 
                         'negociacion',
                         'atrasado',
                         'retirado'
                         )),
    motivo_rechazo TEXT,
    recordatorio_vencimiento_enviado BOOLEAN DEFAULT FALSE,
    recordatorio_vencido_enviado BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_usuario_prestamo FOREIGN KEY (id_usuario) REFERENCES accounts(id) ON DELETE CASCADE,
    UNIQUE(codigo_peticion)
);

CREATE TABLE IF NOT EXISTS detalle_prestamo (
    id SERIAL PRIMARY KEY,
    id_prestamo INTEGER NOT NULL,
    id_componente INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    cantidad_devuelta INTEGER DEFAULT 0,
    estado VARCHAR(50) 
        DEFAULT 'carrito'
        CHECK (estado IN (
                         'carrito', 
                         'pendiente', 
                         'aprobado', 
                         'rechazado', 
                         'devuelto', 
                         'negociacion',
                         'atrasado',
                         'retirado'
                         )),
    CONSTRAINT fk_prestamo FOREIGN KEY (id_prestamo) REFERENCES prestamos(id) ON DELETE CASCADE,
    CONSTRAINT fk_componente FOREIGN KEY (id_componente) REFERENCES componentes(id) ON DELETE CASCADE,
    UNIQUE(id_prestamo, id_componente)
);
