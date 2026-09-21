import Account from "./Account.js";
import Componentes from "./Componentes.js";
import Lab from "./Labs.js";
import Prestamo from "./Prestamo.js";
import DetallePrestamo from "./DetallePrestamo.js";
import Alerta from "./Alerta.js";

// Relación Lab (Bodega) - Componentes (Activos) (1:N)
Lab.hasMany(Componentes, { foreignKey: 'lab_id' });
Componentes.belongsTo(Lab, { foreignKey: 'lab_id' });

// Relación Usuario - Prestamo (Solicitud) (1:N)
Prestamo.belongsTo(Account, { foreignKey: 'id_usuario' });
Account.hasMany(Prestamo, { foreignKey: 'id_usuario' });

// Relación Prestamo - DetallePrestamo (1:N)
Prestamo.hasMany(DetallePrestamo, { foreignKey: 'id_prestamo' });
DetallePrestamo.belongsTo(Prestamo, { foreignKey: 'id_prestamo' });

// Relación Componentes - DetallePrestamo (1:N)
Componentes.hasMany(DetallePrestamo, { foreignKey: 'id_componente' });
DetallePrestamo.belongsTo(Componentes, { foreignKey: 'id_componente' });

export {
    Account,
    Componentes,
    Lab,
    Prestamo,
    DetallePrestamo,
    Alerta
};