import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const Componentes = sequelize.define("Componentes", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  lab_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "labs",
        key: "id"
    }
  },
  familia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_critico: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  codigo_utalca: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero_serial: {
    type: DataTypes.STRING,
    allowNull: true
  },
  //Guardar la referencia a la imagen en lugar de la imagen en sí
  imagen_ref: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "componentes",
  timestamps: true
});

export default Componentes;

    /*
    item	
    id	primary key	
    sku	varchar	
    lab_id	ref: labs.id
	familia	varchar	
    modelo	varchar	
    tipo	varchar	
    cantidad	int	
    codigo_utalca	varchar	
    numero_serial	varchar	
    imagen_ref	varchar	
    descripcion	text
    */
