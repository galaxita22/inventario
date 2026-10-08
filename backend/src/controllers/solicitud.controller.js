import { Solicitud, Activo, Account } from '../models/index.js';
import * as solicitudService from '../services/solicitud.service.js';

export const crearSolicitud = async (req, res) => {
    try {
        const { activo_id, tipo_operacion, justificacion } = req.body;
        const account_id = req.userId; // Esto lo inyecta tu middleware verifyToken

        // Generamos un código de solicitud automático (ej: MOV-123456)
        const codigo_solicitud = `MOV-${Date.now().toString().slice(-6)}`;

        const nuevaSolicitud = await Solicitud.create({
            codigo_solicitud,
            activo_id,
            account_id,
            tipo_operacion, // 'asignacion', 'baja', 'devolucion', etc.
            estado: 'Pendiente',
            justificacion
        });

        res.status(201).json({ mensaje: "Solicitud creada exitosamente", solicitud: nuevaSolicitud });
    } catch (error) {
        console.error("🚨 Error al crear solicitud:", error);
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
