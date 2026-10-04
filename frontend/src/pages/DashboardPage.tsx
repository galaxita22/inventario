import { useState, useEffect } from 'react';
import { Search, Bell, Package, AlertTriangle, Clock, TrendingUp, FileText, CheckCircle, Filter } from 'lucide-react';
import api from '../services/api';
import '../styles/Dashboard.css';


export default function DashboardPage() {
  const [activos, setActivos] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]); // Para jefatura
  const [misSolicitudes, setMisSolicitudes] = useState<any[]>([]); // Para el solicitante
  const [cargando, setCargando] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);

  useEffect(() => {
    // 1. Rescatamos al usuario real que inició sesión
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    setUsuarioActual(user);

    const cargarDatosDashboard = async () => {
      try {
        // Todos tienen permiso para ver el catálogo de activos
        const resActivos = await api.get('/api/activos');
        setActivos(resActivos.data);

        // Si es Jefe, trae las pendientes globales. Si es usuario común, trae las suyas.
        if (user?.role === 'administrador' || user?.role === 'aprobador') {
          const resSolicitudes = await api.get('/api/solicitudes/pendientes');
          setSolicitudes(resSolicitudes.data);
        } else {
          // Asumimos que el backend devuelve todas y filtramos localmente 
          // (Lo ideal a futuro es un endpoint /api/solicitudes/mis-solicitudes)
          const resMisSol = await api.get('/api/solicitudes'); 
          const misSol = resMisSol.data.filter((s: any) => s.solicitante_id === user?.id);
          setMisSolicitudes(misSol);
        }
      } catch (error: any) {
        if (error.response?.status !== 403) {
          console.error("Error al cargar el dashboard:", error);
        }
      } finally {
        setCargando(false);
      }
    };

    cargarDatosDashboard();
  }, []);

  const isAprobador = usuarioActual?.role === 'administrador' || usuarioActual?.role === 'aprobador';
  const apiURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  // ==========================================
  // CÁLCULOS DINÁMICOS PARA JEFATURA
  // ==========================================
  const totalActivos = activos.length;
  const obsoletos = activos.filter(a => a.estado_conservacion === 'obsoleto').length;
  const pendientes = solicitudes.length;
  
  // Adiós dato hardcodeado: Sumamos el valor de cada activo real en BD
  const valorTotal = activos.reduce((sum, activo) => sum + (Number(activo.valor) || 0), 0);
  const valorFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valorTotal);

  // ==========================================
  // CÁLCULOS DINÁMICOS PARA SOLICITANTE
  // ==========================================
  const misPendientes = misSolicitudes.filter(s => s.estado === 'pendiente').length;
  const misAprobadas = misSolicitudes.filter(s => s.estado === 'aprobada').length;

  // ==========================================
  // ALERTAS INTELIGENTES (Cero hardcodeo)
  // ==========================================
  const alertasGeneradas = [];
  if (isAprobador) {
    if (pendientes > 0) alertasGeneradas.push({ id: 1, mensaje: `Tienes ${pendientes} solicitudes de movimiento esperando revisión.`, nivel: 'ADVERTENCIA' });
    if (obsoletos > 0) alertasGeneradas.push({ id: 2, mensaje: `Hay ${obsoletos} equipos reportados como obsoletos/quemados en el sistema.`, nivel: 'CRÍTICO' });
  } else {
    if (misPendientes > 0) alertasGeneradas.push({ id: 1, mensaje: `Tienes ${misPendientes} solicitudes en revisión por jefatura.`, nivel: 'ADVERTENCIA' });
    const misRechazadas = misSolicitudes.filter(s => s.estado === 'rechazada').length;
    if (misRechazadas > 0) alertasGeneradas.push({ id: 2, mensaje: `Atención: Tienes ${misRechazadas} solicitudes de movimiento rechazadas.`, nivel: 'CRÍTICO' });
  }

  // Fallback visual si el usuario no ha subido foto
  const iniciales = (usuarioActual?.nombre_usuario || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="dashboard-container">
      
      {/* HEADER DINÁMICO */}
      <header className="dashboard-topbar">
        <div className="topbar-search">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar activos o movimientos..." />
        </div>
        <div className="topbar-profile">
          <button className="notification-btn">
            <Bell size={20} />
            {alertasGeneradas.length > 0 && <span className="notification-badge">{alertasGeneradas.length}</span>}
          </button>
          
          <div className="profile-info">
            <strong>{usuarioActual?.nombre_usuario || 'Cargando...'}</strong>
            <span>{isAprobador ? 'Jefatura / Aprobador' : 'Usuario Solicitante'}</span>
          </div>
          
          <div className="profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f6ea8', color: 'white', fontWeight: 'bold' }}>
            {usuarioActual?.avatar_ref ? (
              <img src={`${apiURL}${usuarioActual.avatar_ref}`} alt="Perfil" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              iniciales
            )}
          </div>
        </div>
      </header>

      {/* RENDERIZADO CONDICIONAL DE MÉTRICAS SEGÚN ROL */}
      {isAprobador ? (
        // VISTA JEFATURA
        <section className="dashboard-metrics">
          <div className="metric-card">
            <div className="metric-content">
              <span>Total Activos</span>
              <strong>{cargando ? '...' : totalActivos}</strong>
            </div>
            <div className="metric-icon blue-icon"><Package size={24} /></div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <span>Equipos Obsoletos</span>
              <strong>{cargando ? '...' : obsoletos}</strong>
            </div>
            <div className="metric-icon red-icon"><AlertTriangle size={24} /></div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <span>Solicitudes Pendientes</span>
              <strong>{cargando ? '...' : pendientes}</strong>
            </div>
            <div className="metric-icon yellow-icon"><Clock size={24} /></div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <span>Valor Estimado</span>
              <strong>{cargando ? '...' : valorFormateado}</strong>
            </div>
            <div className="metric-icon green-icon"><TrendingUp size={24} /></div>
          </div>
        </section>
      ) : (
        // VISTA USUARIO SOLICITANTE
        <section className="dashboard-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="metric-card">
            <div className="metric-content">
              <span>Mis Solicitudes Activas</span>
              <strong>{cargando ? '...' : misSolicitudes.length}</strong>
            </div>
            <div className="metric-icon blue-icon"><FileText size={24} /></div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <span>En Espera de Jefatura</span>
              <strong>{cargando ? '...' : misPendientes}</strong>
            </div>
            <div className="metric-icon yellow-icon"><Clock size={24} /></div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <span>Solicitudes Aprobadas</span>
              <strong>{cargando ? '...' : misAprobadas}</strong>
            </div>
            <div className="metric-icon green-icon"><CheckCircle size={24} /></div>
          </div>
        </section>
      )}

      {/* GRILLA PRINCIPAL DE TABLA Y ALERTAS */}
      <div className="dashboard-main-grid">
        
        {/* TABLA DE MOVIMIENTOS */}
        <section className="dashboard-section table-section">
          <div className="section-header">
            <div>
              <h2>{isAprobador ? 'Últimos Movimientos del Sistema' : 'Mis Últimas Solicitudes'}</h2>
              <p>Registro histórico reciente de activos</p>
            </div>
            <button className="btn-filtrar">
              <Filter size={16} /> Filtrar
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="movimientos-table">
              <thead>
                <tr>
                  <th>ID Solicitud</th>
                  <th>Operación</th>
                  {isAprobador && <th>Responsable</th>}
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan={isAprobador ? 5 : 4} style={{textAlign: 'center'}}>Cargando datos...</td></tr>
                ) : (isAprobador ? solicitudes : misSolicitudes).length === 0 ? (
                  <tr><td colSpan={isAprobador ? 5 : 4} style={{textAlign: 'center'}}>No hay movimientos registrados</td></tr>
                ) : (
                  (isAprobador ? solicitudes : misSolicitudes).map((sol) => (
                    <tr key={sol.id}>
                      <td className="text-blue font-medium">{sol.codigo_solicitud || `SOL-${sol.id}`}</td>
                      <td className="font-semibold" style={{ textTransform: 'capitalize' }}>{sol.tipo_operacion} (Activo: {sol.activo_id})</td>
                      {isAprobador && <td className="text-gray">{sol.Solicitante?.nombre_usuario || `Usuario ${sol.solicitante_id}`}</td>}
                      <td className="text-gray">{new Date(sol.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${sol.estado.toLowerCase()}`}>
                          {sol.estado.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ALERTAS INTELIGENTES */}
        <section className="dashboard-section alerts-section">
          <div className="section-header">
            <div>
              <h2>Alertas Activas</h2>
              <p>Acciones y advertencias del sistema</p>
            </div>
          </div>
          
          <div className="alerts-list">
            {alertasGeneradas.length === 0 ? (
              <div className="alert-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <p><strong>Todo al día</strong></p>
                <span className="alert-level" style={{color: '#3b82f6'}}>INFO</span>
              </div>
            ) : (
              alertasGeneradas.map((alerta) => (
                <div key={alerta.id} className={`alert-card ${alerta.nivel.toLowerCase()}`}>
                  <p><strong>{alerta.mensaje}</strong></p>
                  <span className="alert-level">{alerta.nivel}</span>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}