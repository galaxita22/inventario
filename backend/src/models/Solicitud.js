import { DataTypes } from 'sequelize';

export const Solicitud = (sequelize) => {
  return sequelize.define('Solicitud', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_solicitante: { type: DataTypes.INTEGER, allowNull: false }, // FK a Usuario (Solicitante)
    id_aprobador: { type: DataTypes.INTEGER, allowNull: true }, // FK a Usuario (Aprobador) - RF010: Segregación de funciones[cite: 5]
    id_activo: { type: DataTypes.INTEGER, allowNull: false }, // FK a Activo
    tipo_operacion: { 
      type: DataTypes.ENUM('alta', 'traslado', 'devolucion', 'baja'), // RF009: Tipos de operación[cite: 5]
      allowNull: false 
    },
    estado: { 
      type: DataTypes.ENUM('borrador', 'pendiente', 'devuelta', 'aprobada', 'rechazada'), // RF011: Estados de solicitud[cite: 5]
      defaultValue: 'borrador'
    },
    observaciones: { type: DataTypes.TEXT, allowNull: true }, // RF011: Permitir observaciones[cite: 5]
    documento_adjunto: { type: DataTypes.STRING, allowNull: true } // Documentos respaldatorios (facturas, guías)[cite: 5]
  });
};