import { Link } from 'react-router-dom';
import { Shield, Package } from 'lucide-react';
import logoInventario from '../assets/logo-inventario.png';
import '../styles/Auth.css';

export default function LandingPage() {
  return (
    <div className="auth-layout">
      <div className="auth-logo-container">
        <img src={logoInventario} alt="Inventario Los Libertadores" className="auth-logo-image" />
      </div>

      <div className="landing-header">
        <h2>Gestión Eficiente de Activos</h2>
        <p>
          Controla, solicita y administra el inventario tecnológico de la organización en un solo lugar de forma centralizada y segura.
        </p>
      </div>

      <div className="landing-cards-container">
        <div className="landing-card">
          <div className="landing-card-icon">
            <Shield size={24} strokeWidth={2.5} />
          </div>
          <h3>Iniciar Sesión</h3>
          <p>Accede con tus credenciales institucionales para gestionar solicitudes y ver tus activos.</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>

        <div className="landing-card">
          <div className="landing-card-icon">
            <Package size={24} strokeWidth={2.5} color="#64748b" />
          </div>
          <h3>Revisar Inventario</h3>
          <p>Consulta la disponibilidad pública de hardware y recursos de la sede central de forma inmediata.</p>
          <Link to="/inventario-publico" className="btn-outline">Revisar Inventario</Link>
        </div>
      </div>
      
      <p className="footer-copy">
        © {new Date().getFullYear()} INV-Control — Plataforma de Gestión de Activos y Solicitudes de TI. Sede Central.
      </p>
    </div>
  );
}