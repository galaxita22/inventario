import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Activo from './Activo.js';
import Account from './Account.js';

const Solicitud = sequelize.define('Solicitud', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tipo_operacion: {
    // Ej: 'alta', 'traslado', 'baja', 'devolucion'
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    // RF011: borrador, pendiente, devuelta, aprobada, rechazada
    type: DataTypes.ENUM('borrador', 'pendiente', 'devuelta', 'aprobada', 'rechazada'),
    defaultValue: 'borrador',
    allowNull: false,
  },
  observaciones: {
    // RF011: Exige ingresar un texto con la observación al rechazar o devolver
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'solicitudes',
  timestamps: true, // Registra fecha de creación y actualización para la bitácora auditable
});

// Relaciones con el Activo
Activo.hasMany(Solicitud, { foreignKey: 'activo_id' });
Solicitud.belongsTo(Activo, { foreignKey: 'activo_id' });

// Relaciones con los Usuarios (RF010: Segregación de funciones)
// Un usuario solicita:
Account.hasMany(Solicitud, { as: 'Solicitadas', foreignKey: 'solicitante_id' });
Solicitud.belongsTo(Account, { as: 'Solicitante', foreignKey: 'solicitante_id' });

// Otro usuario aprueba:
Account.hasMany(Solicitud, { as: 'Aprobadas', foreignKey: 'aprobador_id' });
Solicitud.belongsTo(Account, { as: 'Aprobador', foreignKey: 'aprobador_id' });

export default Solicitud;