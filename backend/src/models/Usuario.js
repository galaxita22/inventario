import { DataTypes } from 'sequelize';

export const Usuario = (sequelize) => {
  return sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }, // RF004: Credenciales de acceso[cite: 5]
    rol: { 
      type: DataTypes.ENUM('Solicitante', 'Aprobador', 'Supervisor', 'Administrador'), // RF002 y RF003[cite: 5]
      allowNull: false 
    }
  });
};