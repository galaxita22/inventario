import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";

// Rutas originales de tu proyecto
import accountRoutes from "./src/routes/account.routes.js";
import componentRoutes from "./src/routes/componentRoutes.js";
import prestamoRoutes from "./src/routes/prestamoRoutes.js";
import detallePrestamoRoutes from "./src/routes/detallePrestamoRoutes.js";
import alertaRoutes from "./src/routes/alerta.routes.js";
import establecimientoRoutes from './src/routes/establecimiento.routes.js';
import ubicacionRoutes from './src/routes/ubicacion.routes.js';
import activoRoutes from './src/routes/activo.routes.js';
import solicitudRoutes from './src/routes/solicitud.routes.js';

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL, 
    "http://localhost:8080", 
    "http://localhost:5173"
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Origen no permitido por CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
    })
);

app.use(express.json());

const uploadDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadDir));

// Endpoints apuntando a tus archivos reales
app.use("/api/accounts", accountRoutes);
app.use("/api/component", componentRoutes);
app.use("/api/prestamo", prestamoRoutes);
app.use("/api/detalle-prestamo", detallePrestamoRoutes);
app.use("/api/alertas", alertaRoutes);
app.use('/api/establecimientos', establecimientoRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/solicitudes', solicitudRoutes);

app.use((error, _req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "El archivo no puede superar 5 MB" });
        }
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

export default app;