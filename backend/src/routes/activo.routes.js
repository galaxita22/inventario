import { Router } from 'express';
import { crearActivo, obtenerActivos } from '../controllers/activo.controller.js';

const router = Router();

router.post('/', crearActivo);
router.get('/', obtenerActivos);

export default router;