import Componentes from "../models/Componentes.js";
import { Op } from "sequelize";

//Buscar componentes por modelo o SKU
export const searchComponents = async (q) => {
    try {
        if (!q) return []; 

        return await Componentes.findAll({
            where: {
                [Op.or]: [
                    { modelo: { [Op.iLike]: `%${q}%` } },
                    { sku: { [Op.iLike]: `%${q}%` } }
                ]
            },
            limit: 10 
        });
    } catch (error) {
        throw new Error("Error al buscar componentes en la base de datos: " + error.message);
    }
};

// Obtener todos los componentes
export const getAllComponents = async () => {
	try {
		return await Componentes.findAll();
	} catch (error) {
		throw new Error("Error al obtener componentes desde la base de datos: " + error.message);
	}
};

export const getComponentById = async (id) => {
	try {
		return await Componentes.findByPk(id);
	} catch (error) {
		throw new Error("Error al obtener el componente desde la base de datos: " + error.message);
	}
};

// Crear un componente
export const createComponent = async (data) => {
	const {
		sku,
		lab_id,
		familia,
		modelo,
		tipo,
		cantidad,
	} = data;

	if (!sku || !lab_id || !familia || !modelo || !tipo) {
		throw new Error("Faltan campos obligatorios");
	}

	if (cantidad && cantidad < 0) {
		throw new Error("Cantidad no puede ser negativa");
	}

	try {
		return await Componentes.create(data);
	} catch (error) {
		throw error; // dejar que el controlador maneje errores específicos de Sequelize
	}
};

export const updateComponent = async (id, data) => {
  try {
    const component = await Componentes.findByPk(id);

    if (!component) {
      throw new Error("Componente no encontrado");
    }

    await component.update(data);
    return component;
  } catch (error) {
    throw error;
  }
};

export const deleteComponent = async (id) => {
	try {
		const component = await Componentes.findByPk(id);
		if (!component) {
			throw new Error("Componente no encontrado");
		}

		await component.destroy();
		return { message: "Componente eliminado correctamente" };
	} catch (error) {
		throw error;
	}
};
