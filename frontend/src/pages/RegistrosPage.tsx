import { useEffect, useState } from "react";
import type { Prestamo } from "../types/Prestamo";
import { cargarPrestamosUsuario } from "../services/adminPrestamosApi";
import "../styles/Registros.css";
import "../styles/Prestamos.css";
import "../styles/AdminRegistros.css";

interface PrestamoConUsuario extends Prestamo {
  usuario: string;
  usuarioId?: number;
  usuarioEmail?: string;
  motivoRechazo?: string;
}

export default function RegistrosPage() {
  const [registros, setRegistros] = useState<PrestamoConUsuario[]>([]);
  const [filtro, setFiltro] = useState<string>("Todos");
  const [ticketSeleccionado, setTicketSeleccionado] = useState<PrestamoConUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarRegistros = async () => {
      setCargando(true);
      setError("");

      try {
        const prestamos = await cargarPrestamosUsuario();
        const historial = prestamos.filter((p) => ['Devuelto', 'Rechazada', 'Cancelada'].includes(p.estado));
        setRegistros(historial as PrestamoConUsuario[]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar el historial.";
        setError(message);
        setRegistros([]);
      } finally {
        setCargando(false);
      }
    };

    void cargarRegistros();
  }, []);

  const registrosFiltrados = registros.filter(p => filtro === "Todos" || p.estado === filtro);

  return (
    <div className="pagina-contenedor">
      <header className="header-azul-hero">
        <div className="header-azul-info">
          <span className="header-azul-eyebrow">Área Personal</span>
          <h1>Historial de Registros</h1>
          <p>Consulta tus préstamos finalizados y solicitudes rechazadas o canceladas.</p>

          {!cargando && (
            <div className="admin-modern-tabs-container dark-mode-tabs margen-tabs">
              {[
                { id: "Todos", label: "Todos los Registros" },
                { id: "Devuelto", label: "Solo Devueltos" },
                { id: "Rechazada", label: "Solo Rechazados" }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`admin-modern-tab ${filtro === tab.id ? 'activa' : ''}`}
                  onClick={() => setFiltro(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
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
        <div className="card-inventario mensaje-vacio-registros">
          <p className="texto-vacio">Cargando registros...</p>
        </div>
      ) : registrosFiltrados.length === 0 ? (
        <div className="card-inventario mensaje-vacio-registros">
          <p className="texto-vacio">No hay registros que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="contenedor-registros-grid">
          {registrosFiltrados.map(p => (
            <article key={p.id} className="registro-card-v2">
              <div className="registro-header">
                <div>
                  <strong className="registro-ticket-id">Solicitud #{p.id.toString().slice(-4)}</strong>
                  <p className="registro-fecha">Realizada el: {p.fechaSolicitud}</p>
                </div>
                <span className={`badge-estado badge-${p.estado.toLowerCase()}`}>
                  {p.estado}
                </span>
              </div>

              <div className="registro-body">
                <div className="registro-info">
                  <p><strong>Motivo:</strong> {p.motivo}</p>
                  {p.estado !== 'Rechazada' && p.estado !== 'Cancelada' && (
                    <p><strong>Devolución:</strong> {p.fechaEstimadaDevolucion}</p>
                  )}
                  <p><strong>Usuario:</strong> {p.usuario}</p>
                  <p><strong>Carrera:</strong> {p.usuarioDetalles?.carrera || "N/A"}</p>
                </div>
                
                <button className="btn-ver-detalles" onClick={() => setTicketSeleccionado(p)}>
                  Ver detalles
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {ticketSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-contenido modal-detalle-ticket">
            <h2 className="titulo-modal-detalle">
              Detalles del Ticket #{ticketSeleccionado.id.toString().slice(-4)}
            </h2>
            
            <div className="caja-info-usuario">
              <p><strong>Nombre:</strong> {ticketSeleccionado.usuario}</p>
              <p><strong>RUT:</strong> {ticketSeleccionado.usuarioDetalles?.rut || "N/A"}</p>
              <p><strong>Matrícula:</strong> {ticketSeleccionado.usuarioDetalles?.matricula || "N/A"}</p>
              <p><strong>Correo:</strong> {ticketSeleccionado.usuarioEmail || ticketSeleccionado.usuarioDetalles?.correo}</p>
            </div>

            {ticketSeleccionado.estado === 'Rechazada' && (
              <div className="caja-motivo-rechazo">
                <p className="texto-motivo-rechazo"><strong>Motivo del rechazo:</strong> {ticketSeleccionado.motivoRechazo || "No se especificó un motivo."}</p>
              </div>
            )}

            <h3 className="subtitulo-equipos">Equipos Solicitados</h3>
            <ul className="lista-equipos-detalle">
              {ticketSeleccionado.items.map((item: any, idx: number) => (
                <li key={idx}>
                  {item.modelo} <strong>(x{item.cantidad})</strong>
                </li>
              ))}
            </ul>

            <div className="footer-modal-detalle">
              <button className="btn-cancelar" onClick={() => setTicketSeleccionado(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
