import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();


export const dbQuilicura = new Sequelize(
  process.env.DB_NAME_QUILICURA || 'db_quilicura',
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql", // Cambio estricto según las bases técnicas
    logging: false,
  }
);

export const dbConchali = new Sequelize(
  process.env.DB_NAME_CONCHALI || 'db_conchali',
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);