import { Router } from 'express';
import { crearSolicitud, obtenerSolicitudes } from '../controllers/solicitud.controller.js';

const router = Router();

router.post('/', crearSolicitud);
router.get('/', obtenerSolicitudes);

export default router;