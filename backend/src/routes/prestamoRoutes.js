import express from "express";
import {
    getAllPrestamos,
    getPrestamosByUserId,
    createPrestamo,
    updatePrestamoEstado,
    updatePrestamoFechaRetiro,
    updatePrestamoFechaDevolucion,
    updatePrestamo,
    actualizarFecha,
    devolucionParcial
} from "../controllers/prestamoController.js";
import { verifyToken } from "../middlewares/authJwt.js";

const router = express.Router();

// GET /api/prestamo/all
router.get("/all", verifyToken, getAllPrestamos);

// GET /api/prestamo/user/:userId
router.get("/user/:userId", verifyToken, getPrestamosByUserId);

// POST /api/prestamo/add
router.post("/add", verifyToken, createPrestamo);

// PUT /api/prestamo/update/:id/estado
router.put("/update/:id/estado", verifyToken, updatePrestamoEstado);

// PUT /api/prestamo/update/:id/retiro
router.put("/update/:id/retiro", verifyToken, updatePrestamoFechaRetiro);

// PUT /api/prestamo/update/:id/devolucion
router.put("/update/:id/devolucion", verifyToken, updatePrestamoFechaDevolucion);

// PUT /api/prestamo/update/:id
router.put("/update/:id", verifyToken, updatePrestamo);

router.patch('/:id/fecha', verifyToken, actualizarFecha);

router.post('/:id/devolucion-parcial', verifyToken, devolucionParcial);

export default router;