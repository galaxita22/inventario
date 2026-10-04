import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { obtenerHistorialActivo } from '../services/activosApi';
import '../styles/ModalHistorial.css';

interface ModalHistorialProps {
  isOpen: boolean;
  onClose: () => void;
  activoId: number | null;
}

export default function ModalHistorialActivo({ isOpen, onClose, activoId }: ModalHistorialProps) {
  const [data, setData] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && activoId) {
      cargarHistorial();
    } else {
      setData(null);
    }
  }, [isOpen, activoId]);

  const cargarHistorial = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await obtenerHistorialActivo(activoId!);
      setData(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-historial-overlay" onClick={onClose}>
      <div className="modal-historial-card" onClick={e => e.stopPropagation()}>
        <div className="modal-historial-header">
          <h2>Auditoría de Activo</h2>
          <button className="modal-historial-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-historial-body">
          {cargando && <p style={{ textAlign: 'center', color: '#64748b' }}>Recopilando historial forense...</p>}
          {error && <p className="error-msg">{error}</p>}
          
          {data && !cargando && (
            <>
              {/* Resumen del equipo */}
              <div className="historial-activo-resumen">
                <h3>{data.activo.descripcion}</h3>
                <p><strong>Código:</strong> {data.activo.codigo_patrimonial}</p>
                <p><strong>Ubicación Actual:</strong> {data.activo.Ubicacion?.nombre || 'Sin ubicación'}</p>
                <p><strong>Estado:</strong> {data.activo.estado_conservacion.toUpperCase()}</p>
              </div>

              <h4 style={{ color: '#0f172a', marginBottom: '16px' }}>Línea de tiempo de movimientos</h4>
              
              {data.movimientos.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center' }}>No existen movimientos registrados para este equipo.</p>
              ) : (
                <div className="timeline-container">
                  {data.movimientos.map((mov: any) => (
                    <div key={mov.id} className="timeline-item">
                      <div className={`timeline-dot ${mov.tipo_operacion === 'baja' ? 'baja' : ''}`}></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <strong>{mov.codigo_solicitud}</strong>
                          <span className="timeline-fecha">
                            {new Date(mov.updatedAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="timeline-info">
                          <p><strong>Operación:</strong> <span style={{textTransform: 'capitalize'}}>{mov.tipo_operacion}</span></p>
                          <p><strong>Solicitado por:</strong> {mov.Solicitante?.nombre_usuario}</p>
                          <p><strong>Aprobado por:</strong> {mov.Aprobador?.nombre_usuario}</p>
                          
                          {mov.tipo_operacion === 'traslado' && (
                            <p><strong>Destino:</strong> {mov.UbicacionDestino?.nombre}</p>
                          )}

                          {mov.observaciones && (
                            <p className="timeline-observaciones">
                              "{mov.observaciones}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}