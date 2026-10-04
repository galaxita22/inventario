import { Activo, Ubicacion, Establecimiento } from '../models/index.js';

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
        // Manejo específico si el código patrimonial ya existe (es UNIQUE en el modelo)
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
        // Traemos el activo con su ubicación, y de paso, el establecimiento de esa ubicación
        const activos = await Activo.findAll({
            include: [{
                model: Ubicacion,
                attributes: ['nombre', 'dependencia'],
                include: [{
                    model: Establecimiento,
                    attributes: ['nombre']
                }]
            }]
        });
        res.status(200).json(activos);
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al obtener los activos", 
            error: error.message 
        });
    }
};