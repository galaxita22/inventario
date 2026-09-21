import { useEffect, useState } from "react";
import ModalPrimerLogin from "../components/ModalPrimerLogin";
import "../styles/ProfilePage.css";
import ModalCambiarFoto from "../components/ModalCambioFoto";
import { cargarPrestamosAdmin } from "../services/adminPrestamosApi";
import type { Componente } from "../types/Componente";
import type { Prestamo } from "../types/Prestamo";


interface User {
  nombre_usuario: string;
  email: string;
  rut: string;
  matricula: string | null;
  escuela: string;
  role: string;
  id: number; 
  avatar_ref?: string | null; 
}

const obtenerIniciales = (nombre: string) => {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase() || 'U';
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [passwords, setPasswords] = useState({ actual: "", nueva: "", confirmar: "" });
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<{ loading: boolean; error: string | null; success: string | null }>({
    loading: false, error: null, success: null
  });
  const [stats, setStats] = useState({ pendientes: 0, atrasados: 0, criticos: 0 });
const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [componentes, setComponentes] = useState<Componente[]>([]);

  const handleCloseFirstLoginModal = async () => {
    try {

      const token = localStorage.getItem("token");

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000";

      await fetch(
        `${apiUrl}/api/accounts/first-login/${storedUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      storedUser.first_login = false;

      localStorage.setItem(
        "user",
        JSON.stringify(storedUser)
      );

      setShowFirstLoginModal(false);

    } catch (error) {
      console.error(
        "Error actualizando first_login",
        error
      );
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setShowFirstLoginModal(storedUser.first_login === true);
        const userId = storedUser.id;

        if (!token || !userId) {
          throw new Error("No hay sesión activa.");
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/api/accounts/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Error al obtener los datos del servidor.");
        }

        const data = await response.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
  if (user?.role === 'administrador') {
    const cargarDatosAdmin = async () => {
      try {
        const prestamosData = await cargarPrestamosAdmin();
        const componentesData = await fetch('http://localhost:3000/api/component/all').then(res => res.json());
        
        setPrestamos(prestamosData);
        setComponentes(componentesData);
        
        setStats({
          pendientes: prestamosData.filter(p => p.estado === 'Pendiente').length,
          atrasados: prestamosData.filter(p => p.estado === 'Atrasado').length,
          criticos: componentesData.filter((c: Componente) => c.cantidad <= c.stock_critico).length
        });
      } catch (e) {
        console.error("Error cargando stats", e);
      }
    };
    void cargarDatosAdmin();
  }
}, [user]);

  if (loading) return <div className="profile-page-container"><p>Cargando perfil...</p></div>;
  if (error) return <div className="profile-page-container"><p className="error-msg">Error: {error}</p></div>;
  if (!user) return <div className="profile-page-container"><p>No se encontraron datos.</p></div>;

  const rolTexto = user.role === "administrador" ? "Administrador" : user.role === "profesional" ? "Docente" : "Estudiante";
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalStatus({ loading: true, error: null, success: null });

    if (passwords.nueva !== passwords.confirmar) {
      setModalStatus({ loading: false, error: "Las contraseñas nuevas no coinciden.", success: null });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const userId = storedUser.id;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/accounts/change-password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          contrasenaActual: passwords.actual,
          nuevaContrasena: passwords.nueva
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cambiar la contraseña");
      }

      setModalStatus({ loading: false, error: null, success: "¡Contraseña actualizada con éxito!" });
      setPasswords({ actual: "", nueva: "", confirmar: "" }); 

      setTimeout(() => {
        setShowModal(false);
        setModalStatus({ loading: false, error: null, success: null });
      }, 2000);

    } catch (err: any) {
      setModalStatus({ loading: false, error: err.message, success: null });
    }
  };
  
  const isAdmin = user.role === 'administrador';

  return (
    <div className={`profile-page-container ${user.role}`}>
      <header className="profile-hero">
        <div className="profile-hero-info">
          
          <div className="profile-avatar-container">
            {user.avatar_ref ? (
              <img src={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}${user.avatar_ref}`} alt="Perfil" className="profile-avatar-img" />
            ) : (
              <div className={`profile-avatar-fallback avatar-${user.role}`}>
                {obtenerIniciales(user.nombre_usuario)}
              </div>
            )}
            <button className="profile-avatar-edit-overlay" onClick={() => setShowAvatarModal(true)}>
              <span>🖍</span> Editar
            </button>
          </div>
          
          <div className="profile-text-container">
            <span className="profile-eyebrow">
              {isAdmin ? "Panel de Control" : "Perfil Institucional"}
            </span>
            <h1>{user.nombre_usuario}</h1>
            <p>{isAdmin ? "Gestión operativa del sistema y administración." : "Revisa y gestiona tu información personal."}</p>
          </div>
        </div>

        <div className="profile-contexto">
          <span>{user.escuela}</span>
          <strong>{rolTexto}</strong>
        </div>
      </header>

      <div className="profile-grid">
        {/* Datos Personales */}
        <section className="profile-card">
          <div className="profile-card-header">
            <div><span>Académico</span><h2>Datos de la Cuenta</h2></div>
          </div>
          <ul className="profile-lista">
            <li>
              <span className="profile-dot profile-disponible"></span>
              <div>
                <strong>Correo Institucional</strong>
                <p>{user.email}</p>
              </div>
            </li>
            <li>
              <span className="profile-dot profile-disponible"></span>
              <div>
                <strong>RUT</strong>
                <p>{user.rut}</p>
              </div>
            </li>
            {!isAdmin && (
              <li>
                <span className="profile-dot profile-disponible"></span>
                <div>
                  <strong>Matrícula</strong>
                  <p>{user.matricula ? user.matricula : "No registrada en el sistema"}</p>
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="profile-card">
          <div className="profile-card-header">
            <div><span>Seguridad</span><h2>Gestión</h2></div>
          </div>
          <div className="profile-accesos">
            {isAdmin ? (
                <>
                    <a href="/admin/cuentas">Gestionar Usuarios</a>
                    <button onClick={() => setShowModal(true)}>Cambiar contraseña</button>
                </>
            ) : (
                <>
                    <button onClick={() => setShowModal(true)}>Cambiar contraseña</button>
                    <a href="mailto:soporte.mkt@utalca.cl">Contactar soporte</a>
                </>
            )}
          </div>
        </section>

        {user.role === 'administrador' && (
  <section className="profile-card" style={{ gridColumn: '1 / -1' }}>
    <div className="profile-card-header">
      <h2>Resumen Operativo</h2>
    </div>

    <div className="admin-widget-grid">
      
      {/* PENDIENTES */}
      <div className="admin-metric-card">
        <span className="admin-metric-label">Pendientes ({stats.pendientes})</span>
        <div className="admin-scroll-list">
          {stats.pendientes > 0 ? (
            prestamos.filter(p => p.estado === 'Pendiente').map(p => (
              <div key={p.id} className="admin-list-item">
                <div className="status-dot profile-pendiente"></div>
                <div className="list-item-content">
                  <span className="list-item-title">Solicitud #{p.id} - Pendiente</span>
                  <span className="list-item-subtitle">{p.usuario} - {p.items.length} item(s)</span>
                </div>
              </div>
            ))
          ) : <p className="list-item-subtitle">No hay pendientes.</p>}
        </div>
      </div>

      {/* ATRASADOS */}
      <div className="admin-metric-card">
        <span className="admin-metric-label">Atrasados ({stats.atrasados})</span>
        <div className="admin-scroll-list">
          {stats.atrasados > 0 ? (
            prestamos.filter(p => p.estado === 'Atrasado').map(p => (
              <div key={p.id} className="admin-list-item">
                <div className="status-dot profile-critico"></div>
                <div className="list-item-content">
                  <span className="list-item-title">Solicitud #{p.id} - Atrasado</span>
                  <span className="list-item-subtitle">{p.usuario} - Vence: {p.fechaEstimadaDevolucion}</span>
                </div>
              </div>
            ))
          ) : <p className="list-item-subtitle">Todo al día.</p>}
        </div>
      </div>

      {/* STOCK CRÍTICO */}
      <div className="admin-metric-card">
        <span className="admin-metric-label">Stock Crítico ({stats.criticos})</span>
        <div className="admin-scroll-list">
          {stats.criticos > 0 ? (
            componentes.filter(c => c.cantidad <= c.stock_critico).map((c: any) => (
              <div key={c.id} className="admin-list-item">
                <div className="status-dot profile-critico"></div>
                <div className="list-item-content">
                  <span className="list-item-title">{c.modelo}</span>
                  <span className="list-item-subtitle">Stock actual: {c.cantidad} (Mín: {c.stock_critico})</span>
                </div>
              </div>
            ))
          ) : <p className="list-item-subtitle">Inventario saludable.</p>}
        </div>
      </div>

    </div>
  </section>
)}
      </div>
      {/* MODAL DE CAMBIO DE CLAVE */}
      {showModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-card">
            <div className="profile-modal-header">
              <h2>Cambiar Contraseña</h2>
              <button className="profile-modal-close" onClick={() => setShowModal(false)}>✖</button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="profile-modal-form">
              {modalStatus.error && <div className="profile-modal-error">{modalStatus.error}</div>}
              {modalStatus.success && <div className="profile-modal-success">{modalStatus.success}</div>}

              <div className="profile-input-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  required
                  value={passwords.actual}
                  onChange={(e) => setPasswords({ ...passwords, actual: e.target.value })}
                  placeholder="Ingresa tu clave actual"
                />
              </div>

              <div className="profile-input-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={passwords.nueva}
                  onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })}
                  placeholder="Ingresa la nueva clave"
                />
              </div>

              <div className="profile-input-group">
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={passwords.confirmar}
                  onChange={(e) => setPasswords({ ...passwords, confirmar: e.target.value })}
                  placeholder="Repite la nueva clave"
                />
              </div>

              <div className="profile-modal-actions">
                <button type="button" className="profile-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="profile-btn-submit" disabled={modalStatus.loading}>
                  {modalStatus.loading ? "Guardando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showFirstLoginModal && (
        <ModalPrimerLogin onClose={handleCloseFirstLoginModal} />
      )}

      <ModalCambiarFoto 
        isOpen={showAvatarModal} 
        onClose={() => setShowAvatarModal(false)} 
        userId={user.id}
        onSuccess={() => window.location.reload()} 
        hasAvatar={!!user.avatar_ref}
      />
    </div>

  );
}
