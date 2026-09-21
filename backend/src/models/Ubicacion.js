import { DataTypes } from 'sequelize';

export const Ubicacion = (sequelize) => {
  return sequelize.define('Ubicacion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    establecimiento: { type: DataTypes.STRING, allowNull: false }, // RF007: Establecimiento[cite: 5]
    dependencia: { type: DataTypes.STRING, allowNull: false }, // RF007: Dependencia[cite: 5]
    ubicacion_fisica: { type: DataTypes.STRING, allowNull: false } // RF007: Ubicación física[cite: 5]
  });
};