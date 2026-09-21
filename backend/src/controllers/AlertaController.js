import * as alertaService from "../services/alerta.service.js"

export const createAlerta = async (req, res) => {
    try {
        const { titulo, mensaje } = req.body;
        const creada_por = req.account.id;

        if (!titulo || !mensaje) {
            return res.status(400).json({ message: "Titulo y mensaje son requeridos" });
        }

        const nuevaAlerta = await alertaService.createAlerta(titulo, mensaje, creada_por);
        res.status(201).json({ message: "Alerta creada", alerta: nuevaAlerta });
    } catch (error) {
        res.status(500).json({ message: error.message || "Ocurrio un error al crear la alerta" });
    }
};

export const getAlertasActivas = async (req, res) => {
    try {
        const alertas = await alertaService.getAlertasActivas();
        res.status(200).json(alertas);
    } catch (error) {
        res.status(500).json({ message: error.message || "Ocurrio un error al obtener las alertas" });
    }
};

export const disableAlerta = async (req, res) => {
    try {
        const { id } = req.params;
        const alertaDesactivada = await alertaService.disableAlerta(id);
        res.status(200).json({ message: "Alerta desactivada", alerta: alertaDesactivada });
    } catch (error) {
        if (error.message === "La alerta no existe") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || "Ocurrio un error al desactivar la alerta" });
    }
};

export const deleteAlerta = async (req, res) => {
    try {
        const { id } = req.params;
        const alertaEliminada = await alertaService.deleteAlerta(id);
        res.status(200).json({ message: "Alerta eliminada", alerta: alertaEliminada });
    } catch (error) {
        if (error.message === "La alerta no existe") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || "Ocurrio un error al eliminar la alerta" });
    }
};