import { Solicitud, Activo, Account } from '../models/index.js';
import * as solicitudService from '../services/solicitud.service.js';

export const crearSolicitud = async (req, res) => {
    try {
        // 1. Extraemos el ubicacion_destino_id del body
        const { tipo_operacion, observaciones, activo_id, ubicacion_destino_id } = req.body;
        const solicitante_id = req.account.id; 
        const role = req.account.role;

        const activoExiste = await Activo.findByPk(activo_id);
        if (!activoExiste) return res.status(404).json({ mensaje: "El activo no existe" });

        const codigo_solicitud = await solicitudService.generarCodigoSolicitud(role, new Date());

        const nuevaSolicitud = await Solicitud.create({
            codigo_solicitud,
            tipo_operacion,
            observaciones,
            activo_id,
            ubicacion_destino_id, // 2. Lo guardamos en la base de datos
            solicitante_id,
            estado: 'pendiente'
        });

        res.status(201).json({ mensaje: "Solicitud registrada con éxito", datos: nuevaSolicitud });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear la solicitud", error: error.message });
    }
};

// Nueva función: Solo para aprobadores
export const obtenerSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await Solicitud.findAll({
            where: { estado: 'pendiente' },
            include: [
                { model: Activo, attributes: ['codigo_patrimonial', 'descripcion'] },
                { model: Account, as: 'Solicitante', attributes: ['nombre_usuario', 'email'] }
            ]
        });
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las solicitudes", error: error.message });
    }
};

// Nueva función: Evaluar la solicitud
export const evaluarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body;
        const aprobador_id = req.account.id;

        const actualizada = await solicitudService.procesarAprobacion(id, estado, observaciones, aprobador_id);
        res.status(200).json({ mensaje: `Solicitud ${estado} con éxito`, datos: actualizada });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};