import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Una única base de datos central como pidió el profesor
const sequelize = new Sequelize(
  process.env.DB_NAME || 'inventario_db',
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql", 
    logging: false,
  }
);

// Exportamos la misma conexión con los nombres antiguos para que 
// tu dbSelector.js y middlewares no se rompan esta noche.
export const dbQuilicura = sequelize;
export const dbConchali = sequelize;

// Exportación por defecto para los modelos
export default sequelize;