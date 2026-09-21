import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Monitor, 
  Package, 
  ClipboardList, 
  UploadCloud,
  LogOut
} from 'lucide-react';
import logoInventario from '../assets/logo-inventario.png';
import '../styles/Sidebar.css';

interface SidebarProps {
  isLoggedIn: boolean;
  userRole: string | null;
  onLogout?: () => void;
}

export default function Sidebar({ isLoggedIn, userRole, onLogout }: SidebarProps) {
  const location = useLocation();

  // Si no está logueado, no mostramos el sidebar
  if (!isLoggedIn) return null;

  // Función auxiliar para saber si la ruta actual coincide con el botón
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar-container">
      {/* Brand / Logo */}
      <div className="sidebar-brand">
        <img src={logoInventario} alt="Inventario Los Libertadores" className="sidebar-logo-img" />
      </div>

      {/* Navegación Principal */}
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link 
          to="/activo-fijo" 
          className={`nav-item ${isActive('/activo-fijo') ? 'active' : ''}`}
        >
          <Monitor size={20} />
          <span>Activo Fijo</span>
        </Link>

        <Link 
          to="/bodega" 
          className={`nav-item ${isActive('/bodega') ? 'active' : ''}`}
        >
          <Package size={20} />
          <span>Bodega</span>
        </Link>

        <Link 
          to="/solicitudes" 
          className={`nav-item ${isActive('/solicitudes') ? 'active' : ''}`}
        >
          <ClipboardList size={20} />
          <span>Solicitudes</span>
        </Link>

        {/* Solo mostramos Carga Masiva si es administrador/aprobador */}
        {userRole === 'aprobador' && (
          <Link 
            to="/carga-masiva" 
            className={`nav-item ${isActive('/carga-masiva') ? 'active' : ''}`}
          >
            <UploadCloud size={20} />
            <span>Carga Masiva</span>
          </Link>
        )}
      </nav>

      {/* Footer del Sidebar */}
      <div className="sidebar-footer">
        <div className="footer-info">
          <strong>Sede Central</strong>
          <span>v2.4.1 — Admin Console</span>
        </div>
        {onLogout && (
          <button onClick={onLogout} className="btn-logout" title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}