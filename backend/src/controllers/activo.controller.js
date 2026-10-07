import { Activo, Ubicacion, Establecimiento, Solicitud, Account } from '../models/index.js'; // <-- Agregamos Establecimiento aquí

export const crearActivo = async (req, res) => {
    try {
        const { codigo_patrimonial, descripcion, categoria, estado_conservacion, valor, ubicacion_id } = req.body;
        
        // Validar que la ubicación existe
        const ubicacionExiste = await Ubicacion.findByPk(ubicacion_id);
        if (!ubicacionExiste) {
            return res.status(404).json({ mensaje: "La ubicación asignada no existe" });
        }

        const nuevoActivo = await Activo.create({
            codigo_patrimonial,
            descripcion,
            categoria,
            estado_conservacion,
            valor,
            ubicacion_id
        });

        res.status(201).json({
            mensaje: "Activo registrado con éxito",
            datos: nuevoActivo
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ mensaje: "El código patrimonial ya está en uso" });
        }
        res.status(500).json({ 
            mensaje: "Error al crear el activo", 
            error: error.message 
        });
    }
};

export const obtenerActivos = async (req, res) => {
    try {
        const { ubicacion_id, estado_conservacion } = req.query;
        
        const whereClause = {};
        if (ubicacion_id) whereClause.ubicacion_id = ubicacion_id;
        if (estado_conservacion) whereClause.estado_conservacion = estado_conservacion;

        const activos = await Activo.findAll({
            where: whereClause,
            include: [{ model: Ubicacion, as: 'Ubicacion', attributes: ['nombre'] }]
        });

        res.status(200).json(activos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los activos", error: error.message });
    }
};

// --- NUEVA FUNCIÓN AGREGADA AQUÍ ---
export const obtenerActivoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const activo = await Activo.findByPk(id, {
            include: [{ 
                model: Ubicacion, 
                as: 'Ubicacion',
                include: [{ model: Establecimiento, attributes: ['nombre', 'rbd'] }]
            }]
        });
        
        if (!activo) return res.status(404).json({ mensaje: "Activo no encontrado" });
        res.status(200).json(activo);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al cargar la ficha del activo", error: error.message });
    }
};

export const obtenerHistorialActivo = async (req, res) => {
    try {
        const { id } = req.params;

        const activo = await Activo.findByPk(id, {
            include: [{ model: Ubicacion, as: 'Ubicacion', attributes: ['nombre'] }]
        });
        
        if (!activo) return res.status(404).json({ mensaje: "Activo no encontrado" });

        const historial = await Solicitud.findAll({
            where: { activo_id: id, estado: 'aprobada' },
            order: [['updatedAt', 'DESC']],
            include: [
                { model: Ubicacion, as: 'UbicacionDestino', attributes: ['nombre'] },
                { model: Account, as: 'Solicitante', attributes: ['nombre_usuario'] },
                { model: Account, as: 'Aprobador', attributes: ['nombre_usuario'] }
            ]
        });

        res.status(200).json({ 
            activo: activo, 
            movimientos: historial 
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el historial", error: error.message });
    }
};
