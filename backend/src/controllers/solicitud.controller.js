import { Solicitud, Activo, Account } from '../models/index.js';
import * as solicitudService from '../services/solicitud.service.js';

export const crearSolicitud = async (req, res) => {
    try {
        const { activo_id, tipo_operacion, justificacion, ubicacion_destino_id } = req.body;
        
        // Cubrimos las formas más comunes en las que verifyToken inyecta el ID
        const account_id = req.userId || req.user?.id || req.usuarioId; 

        if (!activo_id) return res.status(400).json({ mensaje: "Debes seleccionar un activo." });
        if (!account_id) return res.status(400).json({ mensaje: "Error de sesión: No se detectó el ID del usuario." });

        const codigo_solicitud = `MOV-${Date.now().toString().slice(-6)}`;

        const nuevaSolicitud = await Solicitud.create({
            codigo_solicitud,
            activo_id,
            account_id,
            tipo_operacion,
            estado: 'Pendiente',
            justificacion,
            ubicacion_destino_id: ubicacion_destino_id || null
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
            // Si quieres ver también el historial de las aprobadas/rechazadas en la tabla, borra la línea del "where"
            // where: { estado: 'pendiente' }, 
            include: [
                { 
                    model: Activo,
                    as: 'Activo', // Asegúrate de que coincida con el alias en models/index.js
                    attributes: ['id', 'codigo_patrimonial', 'descripcion'] 
                },
                { 
                    model: Account, 
                    as: 'Solicitante', // Como le pusiste 'Solicitante' de alias, lo usaremos así en el front
                    attributes: ['id', 'nombre_usuario', 'email'] // <-- EL 'id' AQUÍ ES CLAVE PARA LA SEGURIDAD
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(solicitudes);
    } catch (error) {
        console.error("🚨 Error al obtener solicitudes:", error);
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
export const actualizarEstadoSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        const evaluadorId = req.userId; // Viene del middleware verifyToken

        const solicitud = await Solicitud.findByPk(id);
        if (!solicitud) return res.status(404).json({ mensaje: "Solicitud no encontrada" });

        // REGLA DE NEGOCIO: Nadie evalúa su propia solicitud
        if (String(solicitud.account_id) === String(evaluadorId)) {
            return res.status(403).json({ 
                mensaje: "Auditoría: No tienes permisos para aprobar o rechazar tu propia solicitud." 
            });
        }

        solicitud.estado = estado;
        await solicitud.save();

        res.status(200).json({ mensaje: `Solicitud marcada como ${estado}`, solicitud });
    } catch (error) {
        console.error("🚨 Error al cambiar estado:", error);
        res.status(500).json({ mensaje: "Error al actualizar estado", error: error.message });
    }
};
