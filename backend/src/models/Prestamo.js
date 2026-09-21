import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const Prestamo = sequelize.define("Prestamo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
    id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
    codigo_peticion: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  fecha_peticion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_retiro: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_estimada_devolucion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_devolucion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM(
        'borrador', 
        'pendiente de aprobación', 
        'devuelta para corrección', 
        'aprobada', 
        'rechazada', 
        'anulada', 
        'ejecutada'
    ),
    defaultValue: 'borrador'
    },
  motivo_rechazo: {
        type: DataTypes.TEXT,
        allowNull: true,     
    },
  recordatorio_vencimiento_enviado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  recordatorio_vencido_enviado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: "prestamos",
  timestamps: false
});

export default Prestamo;
