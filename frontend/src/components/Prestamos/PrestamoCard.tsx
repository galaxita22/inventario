import type { Prestamo } from "../../types/Prestamo";

interface PrestamoCardProps {
  prestamo: Prestamo;
  onActualizar: (prestamoActualizado: Prestamo) => void;
}

const getEstiloEstado = (estado: string) => {
  switch (estado) {
    case 'Pendiente': return { color: '#f59e0b', bg: '#fef3c7' };
    case 'Aprobada': return { color: '#10b981', bg: '#d1fae5' };
    case 'Rechazada': return { color: '#ef4444', bg: '#fee2e2' };
    case 'Devuelto': return { color: '#64748b', bg: '#f1f5f9' };
    case 'Modificada': return { color: '#8b5cf6', bg: '#ede9fe' };
    case 'Atrasado': return { color: 'white', bg: '#ef4444' };
    default: return { color: '#64748b', bg: '#f1f5f9' };
  }
};

export default function PrestamoCard({ prestamo, onActualizar }: Readonly<PrestamoCardProps>) {
  const estilo = getEstiloEstado(prestamo.estado);

  return (
    <article className="card-inventario">
      {/* Ticket */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
        <div>
          <strong style={{ fontSize: '1.1rem', color: 'var(--color-primario)' }}>
            Solicitud #{prestamo.id.toString().slice(-4)}
          </strong>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px' }}>Realizada el: {prestamo.fechaSolicitud}</p>
        </div>
        <div>
          <span style={{
            backgroundColor: estilo.bg,
            color: estilo.color,
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}>
            {prestamo.estado}
          </span>
        </div>
      </div>
      
      {/* Cuerpo del ticket */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 250px' }}>
          <p style={{ marginBottom: '8px' }}><strong>Motivo:</strong> <span style={{ color: '#475569'}}>{prestamo.motivo}</span></p>
          <p><strong>Devolución:</strong> <span style={{ color: '#475569'}}>{prestamo.fechaEstimadaDevolucion}</span></p>
        </div>
        <div style={{ flex: '1 1 250px', background: '#f8fafc', padding: '10px 15px', borderRadius: '8px' }}>
          <strong style={{ fontSize: '0.9rem' }}>Equipos solicitados:</strong>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', color: '#475569', fontSize: '0.95rem' }}>
            {prestamo.items.map((item) => (
              <li key={`${item.sku}-${item.modelo}`} style={{ marginBottom: '4px' }}>
                {item.modelo} <strong>(x{item.cantidad})</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {prestamo.estado === 'Modificada' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px' }}>
          <p style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: 'bold' }}>
             El administrador ha modificado las cantidades. Por favor, confirma si aceptas el préstamo con estos nuevos equipos.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-guardar" onClick={() => onActualizar({ ...prestamo, estado: 'Aprobada' })}>
              Aceptar Modificación
            </button>
            <button className="btn-cancelar" onClick={() => onActualizar({ ...prestamo, estado: 'Rechazada' })}>
              Rechazar Préstamo
            </button>
          </div>
        </div>
      )}
    </article>
  );
}