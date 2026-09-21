import { Prestamo, Account } from "../models/index.js";
import { enviarCorreoPrestamoPorVencer, enviarCorreoPrestamoVencido } from "./servicioCorreo.js";
import { Op } from "sequelize";

/**
 * Obtiene la fecha en formato YYYY-MM-DD correspondiente al huso horario de Chile (America/Santiago)
 * para una fecha dada.
 * 
 * @param {Date} d Objeto Date de origen
 * @returns {string} Fecha formateada como YYYY-MM-DD
 */
const obtenerFechaChile = (d) => {
    const formatter = new Intl.DateTimeFormat("es-CL", {
        timeZone: "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    
    const parts = formatter.formatToParts(d);
    const year = parts.find(p => p.type === "year").value;
    const month = parts.find(p => p.type === "month").value;
    const day = parts.find(p => p.type === "day").value;
    
    return `${year}-${month}-${day}`;
};

/**
 * Busca los préstamos aprobados que vencen exactamente en 7 días y les envía un recordatorio.
 */
export const enviarRecordatoriosPrestamos = async () => {
    console.log("[Reminder Service] Iniciando revisión de préstamos próximos a vencer (7 días)...");
    
    const hoy = new Date();
    const enSieteDias = new Date(hoy);
    enSieteDias.setDate(hoy.getDate() + 7);
    
    const fechaSieteDiasString = obtenerFechaChile(enSieteDias);
    console.log(`[Reminder Service] Buscando préstamos aprobados con fecha estimada de devolución: ${fechaSieteDiasString}`);
    
    try {
        const prestamos = await Prestamo.findAll({
            where: {
                estado: "aprobado",
                fecha_estimada_devolucion: fechaSieteDiasString,
                recordatorio_vencimiento_enviado: false
            },
            include: [
                {
                    model: Account,
                    attributes: ["nombre_usuario", "email", "role"]
                }
            ]
        });
        
        console.log(`[Reminder Service] Se encontraron ${prestamos.length} préstamos por vencer en 7 días.`);
        
        let correosEnviados = 0;
        let correosFallidos = 0;
        
        for (const prestamo of prestamos) {
            try {
                if (!prestamo.Account) {
                    console.error(`[Reminder Service] El préstamo ID ${prestamo.id} no tiene un usuario (Account) asociado válido.`);
                    continue;
                }
                
                console.log(`[Reminder Service] Enviando recordatorio (7 días) a ${prestamo.Account.email} para préstamo ID ${prestamo.id}`);
                
                await enviarCorreoPrestamoPorVencer({
                    account: prestamo.Account,
                    prestamo: prestamo,
                    daysRemaining: 7
                });
                
                // Marcar recordatorio por vencer como enviado
                prestamo.recordatorio_vencimiento_enviado = true;
                await prestamo.save();
                
                correosEnviados++;
            } catch (err) {
                console.error(`[Reminder Service] Error al enviar recordatorio para préstamo ID ${prestamo.id}:`, err);
                correosFallidos++;
            }
        }
        
        console.log(`[Reminder Service] Resumen de envío (7 días): ${correosEnviados} enviados con éxito, ${correosFallidos} fallidos.`);
    } catch (error) {
        console.error("[Reminder Service] Error en recordatorios de 7 días:", error);
        throw error;
    }
};

/**
 * Busca los préstamos que ya vencieron (fecha de devolución estimada en el pasado)
 * y que no han sido devueltos, enviando un correo de alerta.
 */
export const enviarRecordatoriosVencidos = async () => {
    console.log("[Reminder Service] Iniciando revisión de préstamos vencidos...");
    
    const hoy = new Date();
    const fechaHoyString = obtenerFechaChile(hoy);
    console.log(`[Reminder Service] Buscando préstamos aprobados/atrasados vencidos antes de: ${fechaHoyString}`);
    
    try {
        const prestamos = await Prestamo.findAll({
            where: {
                estado: {
                    [Op.in]: ["aprobado", "atrasado"]
                },
                fecha_estimada_devolucion: {
                    [Op.lt]: fechaHoyString
                },
                recordatorio_vencido_enviado: false
            },
            include: [
                {
                    model: Account,
                    attributes: ["nombre_usuario", "email", "role"]
                }
            ]
        });
        
        console.log(`[Reminder Service] Se encontraron ${prestamos.length} préstamos ya vencidos sin notificar.`);
        
        let correosEnviados = 0;
        let correosFallidos = 0;
        
        for (const prestamo of prestamos) {
            try {
                if (!prestamo.Account) {
                    console.error(`[Reminder Service] El préstamo ID ${prestamo.id} no tiene un usuario (Account) asociado válido.`);
                    continue;
                }
                
                console.log(`[Reminder Service] Enviando alerta de vencido a ${prestamo.Account.email} para préstamo ID ${prestamo.id}`);
                
                await enviarCorreoPrestamoVencido({
                    account: prestamo.Account,
                    prestamo: prestamo
                });
                
                // Marcar recordatorio de vencido como enviado
                prestamo.recordatorio_vencido_enviado = true;
                await prestamo.save();
                
                correosEnviados++;
            } catch (err) {
                console.error(`[Reminder Service] Error al enviar alerta de vencido para préstamo ID ${prestamo.id}:`, err);
                correosFallidos++;
            }
        }
        
        console.log(`[Reminder Service] Resumen de envío (vencidos): ${correosEnviados} enviados con éxito, ${correosFallidos} fallidos.`);
    } catch (error) {
        console.error("[Reminder Service] Error en recordatorios vencidos:", error);
        throw error;
    }
};

/**
 * Procesa secuencialmente tanto los recordatorios semanales (7 días) como los de vencimiento superado.
 */
export const procesarTodosLosRecordatorios = async () => {
    console.log("[Reminder Service] Ejecución unificada de recordatorios iniciada.");
    await enviarRecordatoriosPrestamos();
    await enviarRecordatoriosVencidos();
    console.log("[Reminder Service] Ejecución unificada de recordatorios finalizada.");
};
