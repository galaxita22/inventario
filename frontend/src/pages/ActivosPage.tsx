import { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, TrendingUp, Filter, Download } from 'lucide-react';
import { obtenerActivos } from '../services/activosApi'; 
import '../styles/Dashboard.css'; 
import '../styles/ActivosPage.css'; 
import ModalHistorialActivo from '../components/ModalHistorialActivo';

interface Activo {
  id: number;
  codigo_patrimonial: string;
  descripcion: string;
  estado_conservacion: string;
  ubicacion_id: number;
  Ubicacion: { nombre: string };
}

export default function ActivosPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
const [activoSeleccionadoId, setActivoSeleccionadoId] = useState<number | null>(null);

  const cargarInventario = async () => {
    setCargando(true);
    try {
      const data = await obtenerActivos(filtroEstado ? { estado_conservacion: filtroEstado } : {});
      setActivos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, [filtroEstado]);

  const activosFiltrados = activos.filter(a => 
    a.descripcion.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.codigo_patrimonial.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="dashboard-topbar">
        <div className="topbar-search">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar en todo el sistema..." />
        </div>
        <div className="topbar-profile">
          <div className="profile-info">
            <strong>Administración SLEP</strong>
            <span>Control Patrimonial</span>
          </div>
        </div>
      </header>

      {/* Cabecera de la página */}
      <div className="section-header activos-header">
        <div>
          <h1>Gestión de Activos Fijos</h1>
          <p>Administración de inventario y trazabilidad patrimonial</p>
        </div>
        <button className="btn-primario-accion">
          <Plus size={18} /> Agregar Equipo
        </button>
      </div>

      {/* Fila de KPIs */}
      <section className="dashboard-metrics activos-metrics">
        <div className="metric-card">
          <div className="metric-content">
            <span>Equipos Registrados</span>
            <strong>{activos.length}</strong>
          </div>
          <div className="metric-icon blue-icon"><Package size={24} /></div>
        </div>
        <div className="metric-card">
          <div className="metric-content">
            <span>Equipos Obsoletos (Baja)</span>
            <strong>{activos.filter(a => a.estado_conservacion === 'obsoleto').length}</strong>
          </div>
          <div className="metric-icon red-icon"><AlertTriangle size={24} /></div>
        </div>
        <div className="metric-card">
          <div className="metric-content">
            <span>Valor Total Estimado</span>
            <strong>$2,450,000</strong>
          </div>
          <div className="metric-icon green-icon"><TrendingUp size={24} /></div>
        </div>
      </section>

      {/* Contenedor Principal (Tabla) */}
      <section className="dashboard-section table-section">
        <div className="activos-toolbar">
          
          <div className="activos-filtros-grupo">
            <div className="topbar-search activos-search">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar equipo..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <select 
              className="activos-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="bueno">Buen Estado</option>
              <option value="regular">Regular</option>
              <option value="obsoleto">Obsoleto / Baja</option>
            </select>
          </div>

          <button className="btn-filtrar">
            <Download size={16} /> Exportar
          </button>
        </div>

        <div className="table-responsive">
          <table className="movimientos-table">
            <thead>
              <tr>
                <th>Código Patrimonial</th>
                <th>Descripción</th>
                <th>Ubicación Actual</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Cargando inventario...</td></tr>
              ) : activosFiltrados.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No se encontraron equipos.</td></tr>
              ) : (
                activosFiltrados.map((activo) => (
                  <tr key={activo.id}>
                    <td className="text-blue font-medium">{activo.codigo_patrimonial}</td>
                    <td className="font-semibold">{activo.descripcion}</td>
                    <td className="text-gray">{activo.Ubicacion?.nombre || 'Sin ubicación'}</td>
                    <td>
                      <span className={`status-badge ${activo.estado_conservacion === 'obsoleto' ? 'critico' : 'completado'}`}>
                        {activo.estado_conservacion.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-historial"
                        onClick={() => {
                            setActivoSeleccionadoId(activo.id);
                            setModalAbierto(true);
                        }}
                        >
                            Ver Historial
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
   <ModalHistorialActivo 
     isOpen={modalAbierto} 
     onClose={() => setModalAbierto(false)} 
     activoId={activoSeleccionadoId} 
   />
    </div>
  );
}