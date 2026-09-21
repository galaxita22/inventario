import { useState } from 'react';
import { 
  Search, Bell, Package, AlertTriangle, 
  Clock, TrendingUp, Filter 
} from 'lucide-react';
import '../styles/Dashboard.css';

// Interfaces temporales para tipar el diseño
interface Movimiento {
  id: string;
  activo: string;
  tipo: string;
  responsable: string;
  estado: 'Completado' | 'Pendiente';
}

interface Alerta {
  id: number;
  mensaje: string;
  equipo: string;
  nivel: 'CRÍTICO' | 'ADVERTENCIA';
}

export default function DashboardPage() {
  // Datos mockeados basados exactamente en tu diseño
  const [movimientos] = useState<Movimiento[]>([
    { id: 'MOV-001', activo: 'Laptop Dell XPS 15', tipo: 'Ingreso', responsable: 'María González', estado: 'Completado' },
    { id: 'MOV-002', activo: 'Monitor Samsung 27"', tipo: 'Transferencia', responsable: 'Carlos Ruiz', estado: 'Pendiente' },
    { id: 'MOV-003', activo: 'Impresora HP LaserJet', tipo: 'Baja', responsable: 'Ana Martínez', estado: 'Completado' },
    { id: 'MOV-004', activo: 'Teclado Mecánico', tipo: 'Ingreso', responsable: 'Pedro López', estado: 'Pendiente' },
    { id: 'MOV-005', activo: 'Silla Ergonómica', tipo: 'Transferencia', responsable: 'Laura Torres', estado: 'Completado' },
  ]);

  const [alertas] = useState<Alerta[]>([
    { id: 1, mensaje: 'Mantenimiento preventivo vencido', equipo: 'Impresora HP LaserJet', nivel: 'CRÍTICO' },
    { id: 2, mensaje: 'Stock bajo', equipo: 'Tóner compatible (3 unidades)', nivel: 'ADVERTENCIA' },
    { id: 3, mensaje: 'Garantía próxima a vencer', equipo: 'Monitor Samsung 27"', nivel: 'CRÍTICO' },
    { id: 4, mensaje: 'Stock bajo', equipo: 'Papel bond A4 (5 resmas)', nivel: 'ADVERTENCIA' },
    { id: 5, mensaje: 'Calibración requerida', equipo: 'Proyector Epson', nivel: 'CRÍTICO' },
  ]);

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="dashboard-topbar">
        <div className="topbar-search">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar activos o movimientos..." />
        </div>
        <div className="topbar-profile">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">5</span>
          </button>
          <div className="profile-info">
            <strong>Admin Institucional</strong>
            <span>Control de Inventario</span>
          </div>
          <div className="profile-avatar">
            <img src="https://i.pravatar.cc/150?img=47" alt="Perfil" />
          </div>
        </div>
      </header>

      {/* KPI Metrics Row */}
      <section className="dashboard-metrics">
        <div className="metric-card">
          <div className="metric-content">
            <span>Total Activos</span>
            <strong>2,847</strong>
          </div>
          <div className="metric-icon blue-icon">
            <Package size={24} />
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-content">
            <span>Stock Crítico</span>
            <strong>23</strong>
          </div>
          <div className="metric-icon red-icon">
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-content">
            <span>Solicitudes Pendientes</span>
            <strong>15</strong>
          </div>
          <div className="metric-icon yellow-icon">
            <Clock size={24} />
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-content">
            <span>Ingresos del Mes</span>
            <strong>342</strong>
          </div>
          <div className="metric-icon green-icon">
            <TrendingUp size={24} />
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        
        {/* Left Column: Table */}
        <section className="dashboard-section table-section">
          <div className="section-header">
            <div>
              <h2>Últimos Movimientos</h2>
              <p>Registro histórico reciente de activos y productos</p>
            </div>
            <button className="btn-filtrar">
              <Filter size={16} /> Filtrar
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="movimientos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Activo / Producto</th>
                  <th>Tipo Movimiento</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr key={mov.id}>
                    <td className="text-blue font-medium">{mov.id}</td>
                    <td className="font-semibold">{mov.activo}</td>
                    <td className="text-gray">{mov.tipo}</td>
                    <td className="text-gray">{mov.responsable}</td>
                    <td>
                      <span className={`status-badge ${mov.estado.toLowerCase()}`}>
                        {mov.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Alerts */}
        <section className="dashboard-section alerts-section">
          <div className="section-header">
            <div>
              <h2>Alertas Activas</h2>
              <p>Acciones y advertencias urgentes</p>
            </div>
          </div>
          
          <div className="alerts-list">
            {alertas.map((alerta) => (
              <div key={alerta.id} className={`alert-card ${alerta.nivel.toLowerCase()}`}>
                <p>
                  <strong>{alerta.mensaje}</strong> — {alerta.equipo}
                </p>
                <span className="alert-level">{alerta.nivel}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}