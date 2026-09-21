import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const dbQuilicura = new Sequelize(process.env.DATABASE_URL_QUILICURA, {
    dialect: "postgres",
    logging: false, // Apagado para mantener la consola limpia
});

export const dbConchali = new Sequelize(process.env.DATABASE_URL_CONCHALI, {
    dialect: "postgres",
    logging: false,
});