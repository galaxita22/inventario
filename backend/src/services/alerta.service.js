import { Alerta } from "../models/index.js";

export const createAlerta = async (titulo, mensaje, creada_por) => {
    return await Alerta.create({ 
        titulo, 
        mensaje, 
        creada_por, 
        activa: true 
    });
}

export const getAlertasActivas = async () => {
    return await Alerta.findAll({ 
        where: { 
            activa: true 
        },
        order: [['createdAt', 'DESC']]
    });
}

export const disableAlerta = async (id) => {
    const alertaExistente = await Alerta.findByPk(id);

    if(!alertaExistente) {
        throw new Error("La alerta no existe");
    }

    alertaExistente.activa = false;
    return await alertaExistente.save();
}

export const deleteAlerta = async (id) => {
    const alertaExistente = await Alerta.findByPk(id);

    if(!alertaExistente) {
        throw new Error("La alerta no existe");
    }

    await alertaExistente.destroy();
    return alertaExistente;
}