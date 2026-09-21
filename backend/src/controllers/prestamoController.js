import * as prestamoService from '../services/prestamoService.js';
import fs from 'fs';
import path from 'path';
import {enviarCorreoEstadoPrestamo} from '../services/servicioCorreo.js';
import{ getAccountById } from '../services/account.service.js';
// Controlador para préstamos
export const getAllPrestamos = async (req, res) => {
	try {
		const prestamos = await prestamoService.getAllPrestamos();
		return res.status(200).json(prestamos);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getPrestamosByUserId = async (req, res) => {
	const { userId } = req.params;
	if (!userId) {
		return res.status(400).json({ message: 'Falta el id de usuario' });
	}
	try {
		const prestamos = await prestamoService.getPrestamoByUserId(userId);
		return res.status(200).json(prestamos);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const createPrestamo = async (req, res) => {
	const data = req.body;
	try {
		const nuevo = await prestamoService.createPrestamo(data, req.account);
		return res.status(201).json(nuevo);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const updatePrestamoEstado = async (req, res) => {
    const { id } = req.params;
    const { estado, fecha_estimada_devolucion, motivo_rechazo } = req.body;

    if (!id || !estado) {
        return res.status(400).json({
            message: 'Faltan el id o el estado'
        });
    }
    try {
        const actualizado =await prestamoService.updatePrestamoEstado(id,estado,fecha_estimada_devolucion, motivo_rechazo);
		if (estado == "aprobado" || estado == "rechazado") {
        // Obtener usuario para correo
			const account = await getAccountById(actualizado.dataValues.id_usuario);
			if (account) {
				try {
					await enviarCorreoEstadoPrestamo({account,prestamo: actualizado.dataValues,estado});
					console.log("[Servicio de Correo] Correo de estado de préstamo enviado exitosamente a:", account.email);
				} catch (emailError) {
					console.error("[Servicio de Correo] Error enviando correo:",emailError);
				}
			} else{
				console.warn(`No se encontró cuenta para usuario ID ${actualizado.dataValues.id_usuario}, no se enviará correo de estado de préstamo.`);
			}
		}

        return res.status(200).json(actualizado);

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};
export const actualizarFecha = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevaFecha } = req.body;

        if (!id || !nuevaFecha) {
            return res.status(400).json({ message: 'Faltan datos para actualizar la fecha' });
        }

        const actualizado = await prestamoService.actualizarFechaPrestamo(id, nuevaFecha);
        
        return res.status(200).json({ message: "Fecha actualizada con éxito", actualizado });
    } catch (error) {
        console.error("Error al actualizar fecha:", error);
        return res.status(500).json({ message: error.message });
    }
};

// DEVOLUCIÓN PARCIAL (CON CREACIÓN DE NUEVO PRESTAMO PARA EL RESTO DE LOS COMPONENTES)
export const devolucionParcial = async (req, res) => {
    try {
        const { id } = req.params;
        const { detalleId, cantidadDevuelta } = req.body;

        if (!id || !detalleId || cantidadDevuelta == null) {
            return res.status(400).json({ message: 'Faltan datos para la devolución' });
        }

        await prestamoService.procesarDevolucionParcial(id, detalleId, cantidadDevuelta);

        return res.status(200).json({ message: "Devolución procesada correctamente" });
    } catch (error) {
        console.error("Error en devolución parcial:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const updatePrestamoFechaRetiro = async (req, res) => {
	const { id } = req.params;
	if (!id) {
		return res.status(400).json({ message: 'Falta el id del préstamo' });
	}
	try {
		const actualizado = await prestamoService.updatePrestamoFechaRetiro(id);
		return res.status(200).json(actualizado);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const updatePrestamoFechaDevolucion = async (req, res) => {
	const { id } = req.params;
	if (!id) {
		return res.status(400).json({ message: 'Falta el id del préstamo' });
	}
	try {
		const actualizado = await prestamoService.updatePrestamoFechaDevolucion(id);
		return res.status(200).json(actualizado);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const updatePrestamo = async (req, res) => {
	const { id } = req.params;
	const data = req.body;
	if (!id) {
		return res.status(400).json({ message: 'Falta el id del préstamo' });
	}
	try {
		const actualizado = await prestamoService.updatePrestamo(id, data);
		return res.status(200).json(actualizado);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
