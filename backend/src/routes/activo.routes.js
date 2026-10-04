import { Router } from 'express';
import { obtenerActivos, obtenerHistorialActivo } from '../controllers/activo.controller.js';
import { verifyToken } from '../middlewares/authJwt.js';

const router = Router();

// GET /api/activos -> Trae todos o filtra si hay query params
router.get('/', verifyToken, obtenerActivos);

// GET /api/activos/:id/historial -> Trae la línea de tiempo del activo
router.get('/:id/historial', verifyToken, obtenerHistorialActivo);

export default router;