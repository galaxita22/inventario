import { DataTypes } from "sequelize";
import Sequelize from "../database/connection.js";

const Alerta = Sequelize.define("Alerta",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    titulo: {
        type: DataTypes.STRING(200),
        allowNull: false
    },

    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },

    creada_por: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    }

},{
    tableName: "alertas",
    timestamps: true
});

export default Alerta;