import jwt from "jsonwebtoken";
import { getDbPorSede } from '../utils/dbSelector.js';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ message: "No se proporcionó un token de autenticación" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 1. Inyectar datos del usuario
        req.account = decoded; 
        
        // 2. Inyectar la conexión de la BD que le corresponde a este usuario
        req.db = getDbPorSede(decoded.sede); 

        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token no válido o sede no autorizada", error: error.message });
    }
};

export const isAdministrador = (req, res, next) => {
    if (req.account.role !== 'administrador_institucional') {
        return res.status(403).json({ message: "Acceso denegado: Requiere rol de Administrador Institucional" });
    }
    next();
};