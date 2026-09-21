import { DataTypes } from "sequelize";
import Sequelize from "../database/connection.js";

const Account = Sequelize.define("Account",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_usuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.ENUM('solicitante', 'aprobador', 'supervisor', 'administrador'),
        defaultValue: 'solicitante',
        allowNull: false
    },

    rut: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },

    matricula: {
        type: DataTypes.STRING,
        allowNull: true
    },

    escuela: {
        type: DataTypes.STRING,
        allowNull: false
    },

    avatar_ref: {
        type: DataTypes.STRING,
        allowNull: true
    },
    
    first_login: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

},{
    tableName: "accounts",
    timestamps: false
});

export default Account;