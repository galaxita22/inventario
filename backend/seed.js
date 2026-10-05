import sequelize from "./src/database/connection.js";
import { Account } from "./src/models/index.js";

const poblarBaseDeDatos = async () => {
  try {
    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    
    console.log("🔨 Limpiando restricciones y tipos antiguos...");
    await sequelize.query('ALTER TABLE prestamos DROP CONSTRAINT IF EXISTS prestamos_estado_check;');
    
    // Eliminamos la columna por completo para evadir el bug de Sequelize con los ENUMs
    await sequelize.query('ALTER TABLE accounts DROP COLUMN IF EXISTS role;');
    await sequelize.query('DROP TYPE IF EXISTS enum_accounts_role CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS user_role CASCADE;');

    // Sincronizamos. Sequelize creará la columna "role" desde cero con la configuración perfecta.
    await sequelize.sync({ alter: true });

    console.log("🔍 Buscando usuario admin...");
    const admin = await Account.findOne({ where: { email: 'admin@loslibertadores.cl' } });
    
    if (!admin) {
      console.log("❌ Error: No se encontró al admin. Inicia el backend y regístralo primero.");
      process.exit(1);
    }

    // Restauramos el rol del admin (ya que al recrear la columna quedó con el valor por defecto)
    admin.role = 'aprobador'; 
    await admin.save();

    console.log("📦 Insertando Bodega inicial...");
    const [bodega] = await Lab.findOrCreate({
      where: { nombre: 'Bodega Central Quilicura' },
      defaults: { edificio: 'Sede Principal' }
    });

    console.log("💻 Insertando Activos Fijos...");
    const activos = [
      { sku: 'IT-001', familia: 'Computadores', modelo: 'Laptop Dell XPS 15', tipo: 'Hardware', cantidad: 25, stock_critico: 5, lab_id: bodega.id },
      { sku: 'IT-002', familia: 'Periféricos', modelo: 'Monitor Samsung 27"', tipo: 'Hardware', cantidad: 3, stock_critico: 5, lab_id: bodega.id },
      { sku: 'IT-003', familia: 'Impresoras', modelo: 'Impresora HP LaserJet', tipo: 'Hardware', cantidad: 1, stock_critico: 2, lab_id: bodega.id },
      { sku: 'IT-004', familia: 'Periféricos', modelo: 'Teclado Mecánico', tipo: 'Hardware', cantidad: 15, stock_critico: 5, lab_id: bodega.id },
      { sku: 'MOB-001', familia: 'Mobiliario', modelo: 'Silla Ergonómica', tipo: 'Mueble', cantidad: 12, stock_critico: 4, lab_id: bodega.id }
    ];

    for (const activo of activos) {
      await Componentes.findOrCreate({
        where: { modelo: activo.modelo },
        defaults: activo
      });
    }

    console.log("⚠️ Insertando Alertas del sistema...");
    const alertas = [
      { titulo: 'Mantenimiento Vencido (CRÍTICO)', mensaje: 'Impresora HP LaserJet', creada_por: admin.id },
      { titulo: 'Stock Bajo (ADVERTENCIA)', mensaje: 'Monitor Samsung 27" - Quedan 3 unidades', creada_por: admin.id },
      { titulo: 'Garantía próxima a vencer (CRÍTICO)', mensaje: 'Laptop Dell XPS 15', creada_por: admin.id }
    ];

    for (const alerta of alertas) {
      await Alerta.findOrCreate({
        where: { titulo: alerta.titulo },
        defaults: alerta
      });
    }

    console.log("📝 Insertando Solicitudes con los nuevos estados...");
    const nuevosEstados = [
      'ejecutada', 
      'pendiente de aprobación', 
      'devuelta para corrección', 
      'aprobada', 
      'borrador'
    ];
    
    for (const estado of nuevosEstados) {
      await Prestamo.create({
        estado: estado,
        id_usuario: admin.id
      });
    }

    console.log("✅ ¡Datos base inyectados correctamente con el nuevo formato!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error al poblar la base de datos:", error);
    process.exit(1);
  }
};

BaseDeDatos();