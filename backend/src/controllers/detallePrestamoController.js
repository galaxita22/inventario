import * as DetallePrestamoService from '../services/detallePrestamoService.js';
import DetallePrestamo from '../models/DetallePrestamo.js';
import * as prestamoService from '../services/prestamoService.js';
import sequelize from "../database/connection.js";
import fs from 'fs';
import path from 'path';

export const getDetallePrestamoByPrestamoId = async (req, res) => {
    const { prestamoId } = req.params;
    if (!prestamoId) {
        return res.status(400).json({ message: 'Falta el ID del préstamo' });
    }
    try {
        const detalles = await DetallePrestamoService.getDetallePrestamoByPrestamoId(prestamoId);
        return res.status(200).json(detalles);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteDetallePrestamo = async (req, res) => {
    const { id } = req.params;
    try {
        const eliminado = await DetallePrestamo.destroy({ where: { id } });
        
        if (!eliminado) {
            return res.status(404).json({ message: "Ítem no encontrado en la BD" });
        }
        
        return res.status(200).json({ message: "Ítem eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar detalle:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const createDetallePrestamo = async (req, res) => {
    const data = req.body;
    try {
        const nuevo = await DetallePrestamoService.createDetallePrestamo(data);
        return res.status(201).json(nuevo);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

export const updateDetallePrestamo = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Falta el ID del detalle de préstamo' });
    }
    try {
        const actualizado = await DetallePrestamoService.updateDetallePrestamo(id, data);
        return res.status(200).json(actualizado);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateDetalleEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            if (estado === 'retirado') {
                await prestamoService.marcarDetalleComoRetirado(id, t);
            } else if (estado === 'devuelto') {
                await prestamoService.marcarDetalleComoDevuelto(id, t);
            } else {
                // Por si hay que actualizar a otro estado, aunque no se usa actualmente
                const detalle = await DetallePrestamo.findByPk(id, { transaction: t });
                if (detalle) {
                    detalle.estado = estado;
                    await detalle.save({ transaction: t });
                }
            }
        });

        return res.status(200).json({ message: `Detalle actualizado a ${estado} exitosamente` });
    } catch (error) {
        console.error("Error al actualizar detalle:", error);
        return res.status(500).json({ message: error.message });
    }
};

