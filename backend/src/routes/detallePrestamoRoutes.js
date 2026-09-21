import express from "express";
import {
    getDetallePrestamoByPrestamoId,
    createDetallePrestamo,
    updateDetallePrestamo,
    updateDetalleEstado,
    deleteDetallePrestamo
} from "../controllers/detallePrestamoController.js";
import { verifyToken } from "../middlewares/authJwt.js";

const router = express.Router();

// GET /api/detalle-prestamo/prestamo/:prestamoId
router.get("/prestamo/:prestamoId", verifyToken, getDetallePrestamoByPrestamoId);

// POST /api/detalle-prestamo/add
router.post("/add", verifyToken, createDetallePrestamo);

// PUT /api/detalle-prestamo/update/:id
router.put("/update/:id", verifyToken, updateDetallePrestamo);

// PUT /api/detalle-prestamo/update/:id/estado
router.put("/update/:id/estado", verifyToken, updateDetalleEstado);

// DELETE /api/detalle-prestamo/delete/:id
router.delete('/delete/:id', deleteDetallePrestamo);

export default router;