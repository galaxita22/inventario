import { dbQuilicura, dbConchali } from '../database/connection.js';

export const getDbPorSede = (sede) => {
    const sedeNormalizada = String(sede).toLowerCase().trim();
    if (sedeNormalizada === 'quilicura') return dbQuilicura;
    if (sedeNormalizada === 'conchali') return dbConchali;
    throw new Error('Sede no válida o no autorizada');
};