import { useEffect, useState } from "react";
import type { Prestamo, PrestamoItem } from "../types/Prestamo";
import { actualizarEstadoPrestamo, cargarPrestamosUsuario } from "../services/adminPrestamosApi";
import "../styles/Prestamos.css";
import "../styles/AdminRegistros.css";
import { PRESTAMOS_ADMIN_ACTUALIZADOS_EVENT } from "../components/Sidebar";

interface PrestamoConUsuario extends Prestamo { 
  usuario: string; 
  usuarioId?: number; 
  usuarioEmail?: string; 
  motivoRechazo?: string; 
  ocultoEnActivos?: boolean; 
}

const getUsuarioActualKey = () => {
  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return "anonimo";

    const user = JSON.parse(userRaw) as { id?: number; email?: string };
    return String(user.id ?? user.email ?? "anonimo");
  } catch {
    return "anonimo";
  }
};

const getPrestamosOcultosKey = () => `prestamos_ocultos_usuario_${getUsuarioActualKey()}`;

const cargarPrestamosOcultos = () => {
  try {
    const raw = localStorage.getItem(getPrestamosOcultosKey());
    const ids = raw ? JSON.parse(raw) : [];
    return new Set<number>(Array.isArray(ids) ? ids.map(Number) : []);
  } catch {
    localStorage.removeItem(getPrestamosOcultosKey());
    return new Set<number>();
  }
};

const guardarPrestamoOculto = (id: number) => {
  const ocultos = cargarPrestamosOcultos();
  ocultos.add(id);
  localStorage.setItem(getPrestamosOcultosKey(), JSON.stringify([...ocultos]));
};

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<PrestamoConUsuario[]>([]);
  const [prestamosOcultos, setPrestamosOcultos] = useState<Set<number>>(() => cargarPrestamosOcultos());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<string>("Todos");
  const [modalRechazoVisible, setModalRechazoVisible] = useState(false);
  const [prestamoARechazar, setPrestamoARechazar] = useState<number | null>(null);

  const agruparPorLab = (items: PrestamoItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.lab]) acc[item.lab] = [];
      acc[item.lab].push(item);
      return acc;
    }, {} as Record<string, PrestamoItem[]>);
  };

  const cargarPrestamos = async () => {
    setCargando(true);
    setError("");

    try {
      const data = await cargarPrestamosUsuario();

      const ocultosActuales = cargarPrestamosOcultos();
      let limpiarCache = false;

      ocultosActuales.forEach(idGuardado => {
        const prestamoReal = (data as PrestamoConUsuario[]).find(p => p.id === idGuardado);

        if (!prestamoReal || prestamoReal.estado !== 'Rechazada') {
          ocultosActuales.delete(idGuardado);
          limpiarCache = true;
        }
      });

      if (limpiarCache) {
        localStorage.setItem(getPrestamosOcultosKey(), JSON.stringify([...ocultosActuales]));
        setPrestamosOcultos(new Set(ocultosActuales));
      }

      setPrestamos(data as PrestamoConUsuario[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar tus préstamos.";
      setError(message);
      setPrestamos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargarPrestamos(); }, []);
console.log("1. Préstamos crudos del backend:", prestamos);
  console.log("2. IDs de préstamos castigados (ocultos):", prestamosOcultos);
  const prestamosActivos = prestamos.filter(
    (p) => !['Devuelto'].includes(p.estado) && !prestamosOcultos.has(p.id)
  );
  const prestamosFiltrados = prestamosActivos.filter(p => filtro === "Todos" || p.estado === filtro);

  const moverARegistros = async (id: number) => {
    const prestamo = prestamos.find((p) => p.id === id);
    if (!prestamo) return;

    try {
      guardarPrestamoOculto(id);
      setPrestamosOcultos(cargarPrestamosOcultos());
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo mover el préstamo a registros.";
      setError(message);
    }
  };

  const handleAceptarContraoferta = async (id: number) => {
    const prestamo = prestamos.find((p) => p.id === id);
    if (!prestamo) return;

    try {
      await actualizarEstadoPrestamo({ ...prestamo, estado: "Aprobada" });
      await cargarPrestamos();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo aceptar la contraoferta.";
      setError(message);
    }
  };

  const handleRechazarContraoferta = (id: number) => {
    setPrestamoARechazar(id);
    setModalRechazoVisible(true);
  };

  const confirmarRechazo = async () => {
    if (!prestamoARechazar) return;

    const prestamo = prestamos.find((p) => p.id === prestamoARechazar);
    if (!prestamo) return;

    try {
      await actualizarEstadoPrestamo({ 
        ...prestamo, 
        estado: "Rechazada", 
        motivoRechazo: "Rechazado por el usuario" 
      });
      window.dispatchEvent(new Event(PRESTAMOS_ADMIN_ACTUALIZADOS_EVENT));

      guardarPrestamoOculto(prestamo.id);
      setPrestamosOcultos(cargarPrestamosOcultos());

      setModalRechazoVisible(false);
      setPrestamoARechazar(null);
      await cargarPrestamos();

    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo rechazar la contraoferta.";
      setError(message);
    }
  };

  const renderContenidoDerecho = (p: PrestamoConUsuario) => {
    if (p.estado === 'Modificada') {
      return (
        <div className="contenedor-rechazo">
          <div className="header-contraoferta">
            <h3 className="titulo-contraoferta">Contraoferta del Admin</h3>
            <p className="texto-motivo">El administrador modificó tu pedido (equipos o fecha). Revisa las nuevas condiciones:</p>
          </div>
          
          <div className="scroll-contraoferta">
            {Object.entries(agruparPorLab(p.items)).map(([lab, items]) => (
              <div key={lab} className="item-contraoferta">
                <strong>{lab}</strong>
                <ul className="lista-contraoferta">
                  {items.map((item) => (
                    <li key={`${item.sku}-${item.lab}`}>{item.modelo} (x{item.cantidad})</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="contenedor-botones-contraoferta">
            <button className="btn-aceptar-contraoferta" onClick={() => handleAceptarContraoferta(p.id)}>Aceptar</button>
            <button className="btn-rechazar-contraoferta" onClick={() => handleRechazarContraoferta(p.id)}>Rechazar</button>
          </div>
        </div>
      );
    }

    return (
      <div className="contenido-derecho">
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>Ubicaciones de retiro:</p>
        {Object.entries(agruparPorLab(p.items)).map(([lab, items]) => (
          <div key={lab} className="seccion-lab">
            <h3 className="nombre-lab">{lab}</h3>
            <ul className="lista-items-lab">
              {items.map((item) => (
                <li key={`${item.sku}-${item.lab}`}><strong>{item.modelo}</strong> (x{item.cantidad})</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pagina-contenedor">
      <header className="header-azul-hero">
        <div className="header-azul-info">
          <span className="header-azul-eyebrow">Área Personal</span>
          <h1>Mis Préstamos Activos</h1>
          <p>Gestiona tus solicitudes actuales y devoluciones pendientes.</p>

          {/* Pestañas de filtro integradas en el header */}
          {!cargando && (
            <div className="admin-modern-tabs-container dark-mode-tabs margen-tabs">
              {(() => {
                // Hacemos que React cuente cuántas contraofertas hay
                const contadorContraofertas = prestamosActivos.filter(p => p.estado === 'Modificada').length;

                return [
                  { id: "Todos", label: "Todos" },
                  { id: "Pendiente", label: "Pendientes" },
                  { id: "Aprobada", label: "Aprobados" },
                  { id: "Modificada", label: "Contraofertas", notificaciones: contadorContraofertas },
                  { id: "Atrasado", label: "Atrasados" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`admin-modern-tab ${filtro === tab.id ? 'activa' : ''}`}
                    onClick={() => setFiltro(tab.id)}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    {tab.label}
                    {/* Si la pestaña tiene notificaciones y son mayores a 0, dibuja la bolita */}
                    {tab.notificaciones ? (
                      <span className="badge-notificacion-tab">{tab.notificaciones}</span>
                    ) : null}
                  </button>
                ));
              })()}
            </div>
          )}
        </div>

        <div className="header-azul-contexto">
          <span>Vista Personal</span>
          <strong>Usuario Actual</strong>
        </div>
      </header>

      {error && <p className="error-msg">{error}</p>}

      {cargando ? (
        <div className="card-inventario mensaje-vacio-prestamos">
          <p className="texto-vacio">Cargando préstamos...</p>
        </div>
      ) : prestamosFiltrados.length === 0 ? (
        <div className="card-inventario mensaje-vacio-prestamos">
          <p className="texto-vacio">No hay préstamos que coincidan con este filtro.</p>
        </div>
      ) : (
        <div className="lista-prestamos-v2">
          {prestamosFiltrados.map(p => (
            <div key={p.id} className="layout-doble-panel">
              
              <div className="panel-izquierdo">
                <div className="header-prestamo-v3">
                  <div className="header-textos">
                    <h3 className="texto-celeste">Solicitud #{p.id.toString().slice(-4)}</h3>
                    <p className="fecha-solicitud">Realizada el: {p.fechaSolicitud}</p>
                  </div>
                  <span className={`badge-estado-v2 ${p.estado.toLowerCase()}`}>{p.estado}</span>
                </div>

                <hr className="divisor-delgado" />

                <div className="cuerpo-prestamo">
                  <p><strong>Motivo:</strong> {p.motivo}</p>
                  {p.estado !== 'Rechazada' && p.estado !== 'Modificada' && (
                    <p><strong>Devolución:</strong> {p.fechaEstimadaDevolucion}</p>
                  )}
                  {p.estado === 'Modificada' && (
                    <p><strong>Nueva Devolución Propuesta:</strong> <span className="texto-alerta">{p.fechaEstimadaDevolucion}</span></p>
                  )}
                  <p><strong>Usuario:</strong> {p.usuario}</p>
                  <p><strong>Carrera:</strong> {p.usuarioDetalles?.carrera || "N/A"}</p>
                </div>

                {p.estado !== 'Rechazada' && (
                  <div className="instrucciones-retiro">
                    <div className="alerta-id">
                      <strong>⚠️ Importante:</strong> Para retirar tus artículos debes presentar tu carnet de identidad, TUI o documento válido.
                    </div>
                  </div>
                )}
              </div>

              <div className={`panel-derecho ${p.estado.toLowerCase()}`}>
                {p.estado === 'Rechazada' ? (
                  <div className="contenedor-rechazo">
                    <h3 className="titulo-rechazo">Motivo de rechazo</h3>
                    <p className="texto-motivo">
                      {p.motivoRechazo || "El administrador no especificó un motivo. Por favor, comunícate con el laboratorio correspondiente."}
                    </p>
                    <button className="btn-enviar-registros" onClick={() => moverARegistros(p.id)}>
                      Ocultar y enviar a registros
                    </button>
                  </div>
                ) : (
                  renderContenidoDerecho(p)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/*  MODAL */}
      {modalRechazoVisible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', // Un fondo oscuro elegante
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card-inventario" style={{ 
            padding: '30px', 
            maxWidth: '400px', 
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>¿Rechazar contraoferta?</h3>
            <p style={{ color: '#475569', marginBottom: '25px', fontSize: '0.95rem' }}>
              Al rechazar la propuesta del administrador, este pedido se cancelará por completo y desaparecerá de tus activos. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                className="btn-guardar" 
                style={{ backgroundColor: '#94a3b8', color: 'white' }} 
                onClick={() => setModalRechazoVisible(false)}
              >
                Volver
              </button>
              <button 
                className="btn-cancelar" 
                style={{ backgroundColor: '#ef4444', color: 'white' }} 
                onClick={confirmarRechazo}
              >
                Sí, cancelar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}
