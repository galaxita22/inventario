import DetallePrestamo from "../models/DetallePrestamo.js";
import Componentes from "../models/Componentes.js";
import sequelize from "../database/connection.js";

// Obtener detalles de un préstamo por ID de préstamo
export const getDetallePrestamoByPrestamoId = async (prestamoId) => {
    if (!prestamoId) {
        throw new Error("Falta el ID del préstamo");
    }

    try {
        return await DetallePrestamo.findAll({ where: { id_prestamo: prestamoId } });
    } catch (error) {
        throw new Error("Error al obtener detalles de préstamo desde la base de datos: " + error.message);
    }
};

// Crear un detalle de préstamo
export const createDetallePrestamo = async (data) => {
    const { id_prestamo, id_componente, cantidad } = data;

    if (!id_prestamo || !id_componente || !cantidad) {
        throw new Error("Faltan campos obligatorios");
    }

    if (cantidad <= 0) {
        throw new Error("La cantidad debe ser mayor a cero");
    }

    const transaction = await sequelize.transaction();

    try {
        const componente = await Componentes.findByPk(id_componente, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!componente) {
            throw new Error("Componente no encontrado");
        }

        if (componente.cantidad < cantidad) {
            throw new Error(`Stock insuficiente para ${componente.modelo}. Disponible: ${componente.cantidad}`);
        }

        const detalle = await DetallePrestamo.create(data, { transaction });
        await transaction.commit();
        return detalle;
    } catch (error) {
        await transaction.rollback();
        throw new Error("Error al crear el detalle de préstamo en la base de datos: " + error.message);
    }
};

// Actualizar un detalle de préstamo
export const updateDetallePrestamo = async (id, data) => {
    const transaction = await sequelize.transaction();

    try {
        const detalle = await DetallePrestamo.findByPk(id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!detalle) {
            throw new Error("Detalle de préstamo no encontrado");
        }

        if (data.cantidad !== undefined) {
            const nuevaCantidad = Number(data.cantidad);

            if (!Number.isFinite(nuevaCantidad) || nuevaCantidad <= 0) {
                throw new Error("La cantidad debe ser mayor a cero");
            }

            const componente = await Componentes.findByPk(detalle.id_componente, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!componente) {
                throw new Error("Componente no encontrado");
            }

            if (componente.cantidad < nuevaCantidad) {
                throw new Error(`Stock insuficiente para ${componente.modelo}. Disponible: ${componente.cantidad}`);
            }
        }

        await detalle.update(data, { transaction });
        await transaction.commit();
        return detalle;
    } catch (error) {
        await transaction.rollback();
        throw new Error("Error al actualizar el detalle de préstamo en la base de datos: " + error.message);
    }
};
