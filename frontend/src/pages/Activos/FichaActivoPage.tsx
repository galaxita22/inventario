import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, DollarSign, FileText, Upload } from 'lucide-react';
import api from '../../services/api';
import './ActivosPage.css'; // Reutilizamos estilos generales

export default function FichaActivoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activo, setActivo] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFicha = async () => {
      try {
        const res = await api.get(`/api/activos/${id}`);
        setActivo(res.data);
      } catch (err: any) {
        setError('No se pudo cargar la ficha del activo');
      } finally {
        setCargando(false);
      }
    };
    fetchFicha();
  }, [id]);

  if (cargando) return <div className="activos-container"><h2>Cargando ficha...</h2></div>;
  if (error || !activo) return <div className="activos-container"><h2 style={{color: 'red'}}>{error}</h2></div>;

  return (
    <div className="activos-container">
      <div className="activos-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-cancelar" onClick={() => navigate('/activos')} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Ficha de Activo: {activo.codigo_patrimonial}</h1>
            <p>Registro individual de patrimonio institucional</p>
          </div>
        </div>
        <span className={`badge ${activo.estado_conservacion.toLowerCase()}`} style={{ fontSize: '1rem', padding: '8px 16px' }}>
          Estado: {activo.estado_conservacion.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        
        {/* Panel Identificación */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primario)', marginBottom: '16px' }}>
            <Tag size={20} /> Datos de Identificación
          </h3>
          <p><strong>Descripción:</strong> {activo.descripcion}</p>
          <p><strong>Categoría:</strong> {activo.categoria}</p>
          <p><strong>Fecha de Ingreso:</strong> {new Date(activo.createdAt).toLocaleDateString('es-CL')}</p>
        </div>

        {/* Panel Ubicación */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primario)', marginBottom: '16px' }}>
            <MapPin size={20} /> Ubicación Física
          </h3>
          <p><strong>Establecimiento:</strong> {activo.Ubicacion?.Establecimiento?.nombre || 'No asignado'}</p>
          <p><strong>Dependencia:</strong> {activo.Ubicacion?.nombre}</p>
        </div>

        {/* Panel Valorización */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primario)', marginBottom: '16px' }}>
            <DollarSign size={20} /> Valorización
          </h3>
          <p><strong>Valor Contable:</strong> ${activo.valor?.toLocaleString('es-CL') || 0}</p>
        </div>

        {/* Panel Documentos */}
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primario)', marginBottom: '16px' }}>
            <FileText size={20} /> Documentos Adjuntos
          </h3>
          <div style={{ border: '2px dashed #cbd5e1', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '12px' }}>
              Sin documentos (facturas o actas) adjuntos.
            </p>
            <button className="btn-cancelar" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={16} /> Subir Documento
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}