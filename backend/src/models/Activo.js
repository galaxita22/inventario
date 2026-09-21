import { DataTypes } from 'sequelize';

export const Activo = (sequelize) => {
  return sequelize.define('Activo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo_unico: { type: DataTypes.STRING, unique: true, allowNull: false }, // RF006: Código patrimonial, QR o barras[cite: 5]
    identificacion: { type: DataTypes.STRING, allowNull: false }, // RF005: Datos de identificación[cite: 5]
    valorizacion: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // RF005: Valorización[cite: 5]
    cantidad_disponible: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    stock_minimo: { type: DataTypes.INTEGER, allowNull: false }, // RF008: Nivel mínimo[cite: 5]
    stock_critico: { type: DataTypes.INTEGER, allowNull: false }, // RF008: Nivel crítico[cite: 5]
    stock_maximo: { type: DataTypes.INTEGER, allowNull: false }, // RF008: Nivel máximo[cite: 5]
    documento_adjunto: { type: DataTypes.STRING, allowNull: true }, // RF005: Documentos[cite: 5]
    id_ubicacion: { type: DataTypes.INTEGER, allowNull: false } // FK a Ubicacion
  });
};