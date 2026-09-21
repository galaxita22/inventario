import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const DetallePrestamo = sequelize.define("DetallePrestamo", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_prestamo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "prestamos",
            key: "id"
        }
    },
    id_componente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    cantidad_devuelta: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    },
    estado: {
        type: DataTypes.ENUM("borrador", "pendiente", "aprobado", "rechazado", "devuelto", "atrasado", "retirado"),
        allowNull: true,
        defaultValue: "borrador"
    }
}, {
    tableName: "detalle_prestamo",
    timestamps: false
});

export default DetallePrestamo;