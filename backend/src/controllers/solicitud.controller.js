import { Solicitud, Activo } from '../models/index.js';
// Nota: Asumimos que tienes el modelo Account exportado en tu index.js

export const crearSolicitud = async (req, res) => {
    try {
        const { tipo_operacion, observaciones, activo_id, solicitante_id } = req.body;
        
        // Verificar que el activo exista antes de solicitar algo sobre él
        const activoExiste = await Activo.findByPk(activo_id);
        if (!activoExiste) {
            return res.status(404).json({ mensaje: "El activo no existe" });
        }

        const nuevaSolicitud = await Solicitud.create({
            tipo_operacion,
            observaciones,
            activo_id,
            solicitante_id,
            estado: 'pendiente' // La ingresamos directamente como pendiente de revisión
        });

        res.status(201).json({
            mensaje: "Solicitud registrada con éxito",
            datos: nuevaSolicitud
        });
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al crear la solicitud", 
            error: error.message 
        });
    }
};

export const obtenerSolicitudes = async (req, res) => {
    try {
        const solicitudes = await Solicitud.findAll({
            include: [{
                model: Activo,
                attributes: ['codigo_patrimonial', 'descripcion']
            }]
            // TO DO: Si tienes la relación de Account bien armada, luego podemos incluir quién la solicitó
        });
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al obtener las solicitudes", 
            error: error.message 
        });
    }
};