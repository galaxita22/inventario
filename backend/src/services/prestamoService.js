import { Transaction, Op } from "sequelize";
import Prestamo from "../models/Prestamo.js";
import Account from "../models/Account.js";
import DetallePrestamo from "../models/DetallePrestamo.js";
import Componentes from "../models/Componentes.js";
import sequelize from "../database/connection.js";

const PREFIJO_POR_ROL = {
    administrador: 'ADM',
    comun: 'COM',
    profesional: 'PRO'
};

const formatearFechaCodigo = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

const generarCodigoPeticion = async (role, fechaPeticion, transaction) => {
    const prefijo = PREFIJO_POR_ROL[role] || PREFIJO_POR_ROL.comun;
    const fechaCodigo = formatearFechaCodigo(fechaPeticion);

    const totalDelDia = await Prestamo.count({
        where: { fecha_peticion: fechaCodigo },
        transaction
    });

    const correlativo = String(totalDelDia + 1).padStart(4, '0');
    return `${prefijo}-${fechaCodigo}-${correlativo}`;
};

const esErrorDeConcurrencia = (error) => {
    return error?.name === 'SequelizeUniqueConstraintError'
        || error?.original?.code === '23505'
        || error?.original?.code === '40001';
};

const ESTADOS_CON_STOCK_RESTAURADO = new Set(["rechazado", "devuelto"]);

const descontarStockPrestamo = async (prestamoId, transaction) => {
    const detalles = await DetallePrestamo.findAll({
        where: { id_prestamo: prestamoId },
        transaction,
        lock: transaction.LOCK.UPDATE
    });

    if (detalles.length === 0) {
        throw new Error("El préstamo no tiene componentes asociados");
    }

    for (const detalle of detalles) {
        const componente = await Componentes.findByPk(detalle.id_componente, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!componente) {
            throw new Error("Componente no encontrado");
        }

        if (componente.cantidad < detalle.cantidad) {
            throw new Error(`Stock insuficiente para ${componente.modelo}. Disponible: ${componente.cantidad}`);
        }

        componente.cantidad -= detalle.cantidad;
        await componente.save({ transaction });
    }
};

const restaurarStockPrestamo = async (prestamoId, transaction) => {
    const detalles = await DetallePrestamo.findAll({
        where: { id_prestamo: prestamoId },
        transaction,
        lock: transaction.LOCK.UPDATE
    });

    for (const detalle of detalles) {
        const componente = await Componentes.findByPk(detalle.id_componente, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (componente) {
            componente.cantidad += detalle.cantidad;
            await componente.save({ transaction });
        }
    }
};

// Obtener todos los préstamos
export const getAllPrestamos = async () => {
    try {
        return await Prestamo.findAll();
    } catch (error) {
        throw new Error("Error al obtener préstamos desde la base de datos: " + error.message);
    }
};

// Obtener un préstamo por ID de usuario
export const getPrestamoByUserId = async (userId) => {
    try {
        return await Prestamo.findAll({ where: { id_usuario: userId } });
    } catch (error) {
        throw new Error("Error al obtener el préstamo desde la base de datos: " + error.message);
    }
};

// Crear un nuevo préstamo
export const createPrestamo = async (data, requester) => {
    if (!requester?.id) {
        throw new Error("No se pudo identificar al usuario autenticado");
    }

    const accountSolicitante = await Account.findByPk(requester.id);
    if (!accountSolicitante) {
        throw new Error("Usuario no encontrado");
    }

    const fechaPeticion = new Date();
    const fechaPeticionSinHora = formatearFechaCodigo(fechaPeticion);
    const maxIntentos = 3;

    for (let intento = 1; intento <= maxIntentos; intento += 1) {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        });

        try {
            const codigo_peticion = await generarCodigoPeticion(
                accountSolicitante.role,
                fechaPeticion,
                transaction
            );

            const nuevoPrestamo = await Prestamo.create({
                ...data,
                id_usuario: accountSolicitante.id,
                fecha_peticion: fechaPeticionSinHora,
                codigo_peticion,
                estado: data.estado || "pendiente"
            }, { transaction });

            await transaction.commit();
            return nuevoPrestamo;
        } catch (error) {
            await transaction.rollback();

            if (intento < maxIntentos && esErrorDeConcurrencia(error)) {
                continue;
            }

            throw new Error("Error al crear el préstamo en la base de datos: " + error.message);
        }
    }
};      

// Fijar una nueva fecha estimada de devolución
export const actualizarFechaPrestamo = async (id, nuevaFecha) => {
    if (!id || !nuevaFecha) {
        throw new Error("Faltan datos para actualizar la fecha");
    }

    try {
        const prestamo = await Prestamo.findByPk(id);
        if (!prestamo) {
            throw new Error("Préstamo no encontrado");
        }
        
        prestamo.fecha_estimada_devolucion = nuevaFecha;
        return await prestamo.save();
    } catch (error) {
        throw new Error("Error al actualizar la fecha en la base de datos: " + error.message);
    }
};

export const procesarDevolucionParcial = async (prestamoId, detalleId, cantidadDevuelta) => {
    const transaction = await sequelize.transaction();
    
    const cantidadNum = Number(cantidadDevuelta);

    try {
        const detalle = await DetallePrestamo.findByPk(detalleId, { transaction });
        if (!detalle) throw new Error("Detalle de préstamo no encontrado");

        // Usamos cantidadNum para evitar concatenaciones raras
        detalle.cantidad_devuelta = (detalle.cantidad_devuelta || 0) + cantidadNum;

        if (detalle.cantidad_devuelta >= detalle.cantidad) {
            detalle.estado = 'devuelto';
            detalle.cantidad_devuelta = detalle.cantidad; 
        }

        await detalle.save({ transaction });

        const componente = await Componentes.findByPk(detalle.id_componente, { 
            transaction, lock: transaction.LOCK.UPDATE 
        });
        
        if (componente) {
            componente.cantidad += cantidadNum;
            await componente.save({ transaction });
        }

        const pendientes = await DetallePrestamo.count({
            where: { 
                id_prestamo: prestamoId, 
                estado: { [Op.notIn]: ['devuelto', 'cancelado', 'rechazado'] } 
            },
            transaction
        });

        if (pendientes === 0) {
            const prestamo = await Prestamo.findByPk(prestamoId, { transaction });
            prestamo.estado = 'devuelto';
            prestamo.fecha_devolucion = new Date();
            await prestamo.save({ transaction });
        }

        await transaction.commit();
        return { message: "Devolución parcial procesada exitosamente" };

    } catch (error) {
        await transaction.rollback();
        
        if (error.name === 'SequelizeValidationError') {
            console.error("ERROR DE VALIDACIÓN EXACTO:", error.errors.map(e => e.message));
        } else {
            console.error("ERROR DESCONOCIDO:", error);
        }
        
        throw new Error("Error procesando la devolución parcial: " + error.message);
    }
};

//cambiar estado del préstamo
export const updatePrestamoEstado = async (id, estado, fechaEstimadaDevolucion = null, motivoRechazo = null) => {    if (!id || !estado) {
        throw new Error("Faltan campos obligatorios");
    }

    const maxIntentos = 3;

    for (let intento = 1; intento <= maxIntentos; intento += 1) {
        const transaction = await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        });

        try {
            const prestamo = await Prestamo.findByPk(id, { transaction });
            if (!prestamo) {
                throw new Error("Préstamo no encontrado");
            }

            const estadoAnterior = prestamo.estado;
            prestamo.estado = estado;

            if (motivoRechazo !== null && motivoRechazo !== undefined) {
                prestamo.motivo_rechazo = motivoRechazo;
            }

            if (estado === 'pendiente' && (!prestamo.codigo_peticion || !prestamo.fecha_peticion)) {
                const cuenta = await Account.findByPk(prestamo.id_usuario, { transaction });
                if (!cuenta) {
                    throw new Error("Usuario no encontrado");
                }

                const fechaPeticion = new Date();
                prestamo.fecha_peticion = formatearFechaCodigo(fechaPeticion);
                prestamo.codigo_peticion = await generarCodigoPeticion(
                    cuenta.role,
                    fechaPeticion,
                    transaction
                );
            }

            if (fechaEstimadaDevolucion !== null && fechaEstimadaDevolucion !== undefined) {
                prestamo.fecha_estimada_devolucion = fechaEstimadaDevolucion || null;
            }

            if (estado === "aprobado" && estadoAnterior !== "aprobado") {
                await descontarStockPrestamo(prestamo.id, transaction);
            }

            if (
                ESTADOS_CON_STOCK_RESTAURADO.has(estado) &&
                estadoAnterior === "aprobado"
            ) {
                await restaurarStockPrestamo(prestamo.id, transaction);
            }

            const actualizado = await prestamo.save({ transaction });
            await transaction.commit();
            return actualizado;
        } catch (error) {
            await transaction.rollback();

            if (intento < maxIntentos && esErrorDeConcurrencia(error)) {
                continue;
            }

            throw new Error("Error al actualizar el préstamo en la base de datos: " + error.message);
        }
    }
};


//Fijar fecha de retiro
export const updatePrestamoFechaRetiro = async (id) => {
    if (!id) {
        throw new Error("Falta el ID del préstamo");
    }

    try {
        const prestamo = await Prestamo.findByPk(id);
        if (!prestamo) {
            throw new Error("Préstamo no encontrado");
        }
        prestamo.fecha_retiro = new Date();
        return await prestamo.save();
    } catch (error) {
        throw new Error("Error al actualizar el préstamo en la base de datos: " + error.message);
    }
};

//Fijar fecha de devolución
export const updatePrestamoFechaDevolucion = async (id) => {
    if (!id) {
        throw new Error("Falta el ID del préstamo");
    }

    try {
        const prestamo = await Prestamo.findByPk(id);
        if (!prestamo) {
            throw new Error("Préstamo no encontrado");
        }
        prestamo.fecha_devolucion = new Date();
        return await prestamo.save();
    } catch (error) {
        throw new Error("Error al actualizar el préstamo en la base de datos: " + error.message);
    }
};

// Editar un préstamo
export const updatePrestamo = async (id, data) => {
    try {
        const prestamo = await Prestamo.findByPk(id);
        if (!prestamo) {
            throw new Error("Préstamo no encontrado");
        }
        return await prestamo.update(data);
    } catch (error) {
        throw new Error("Error al actualizar el préstamo en la base de datos: " + error.message);
    }
};

export const marcarDetalleComoRetirado = async (id_detalle, transaction) => {
    const detalle = await DetallePrestamo.findByPk(id_detalle, { transaction });
    detalle.estado = 'retirado';
    await detalle.save({ transaction });

    const totalPendientes = await DetallePrestamo.count({
        where: { id_prestamo: detalle.id_prestamo, estado: { [Op.ne]: 'retirado' } },
        transaction
    });

    if (totalPendientes === 0) {
        const prestamo = await Prestamo.findByPk(detalle.id_prestamo, { transaction });
        prestamo.estado = 'aprobado';
        await prestamo.save({ transaction });
    }
};

export const marcarDetalleComoDevuelto = async (id_detalle, transaction) => {
    const detalle = await DetallePrestamo.findByPk(id_detalle, { transaction });
    detalle.estado = 'devuelto';
    await detalle.save({ transaction });

    const componente = await Componentes.findByPk(detalle.id_componente, { 
        transaction, 
        lock: transaction.LOCK.UPDATE 
    });
    
    if (componente) {
        componente.cantidad += detalle.cantidad;
        await componente.save({ transaction });
    }

    const pendientes = await DetallePrestamo.count({
        where: { 
            id_prestamo: detalle.id_prestamo, 
            estado: { [Op.notIn]: ['devuelto', 'cancelado', 'rechazado'] } 
        },
        transaction
    });

    if (pendientes === 0) {
        const prestamo = await Prestamo.findByPk(detalle.id_prestamo, { transaction });
        prestamo.estado = 'devuelto';
        prestamo.fecha_devolucion = new Date();
        await prestamo.save({ transaction });
    }
};