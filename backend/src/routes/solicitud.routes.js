import { Router } from 'express';
import { crearSolicitud, obtenerSolicitudesPendientes, evaluarSolicitud } from '../controllers/solicitud.controller.js';
import { verifyToken, isAprobador } from '../middlewares/authJwt.js'; // Importa el middleware

const router = Router();

// Creación (Cualquier usuario logueado)
router.post('/', verifyToken, crearSolicitud);

// Aprobaciones (Solo roles autorizados)
// Aprobaciones (Solo roles autorizados)
router.get('/api/solicitudes', verifyToken, isAprobador, obtenerSolicitudesPendientes);
router.put('/api/solicitudes/:id/evaluar', verifyToken, isAprobador, evaluarSolicitud); // Ruta blindada

export default router;
