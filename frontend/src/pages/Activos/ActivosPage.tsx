import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { type Activo } from '../../types/Activo';
import './ActivosPage.css';

export default function ActivosPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchActivos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_URL}/api/activos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar los activos');
        
        const data = await response.json();
        setActivos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchActivos();
  }, [BACKEND_URL]);

  // Filtrado dinámico por código patrimonial o descripción
  const activosFiltrados = activos.filter(activo => 
    activo.codigo_patrimonial.toLowerCase().includes(busqueda.toLowerCase()) ||
    activo.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="activos-container">
      <div className="activos-header">
        <div>
          <h1>Patrimonio Institucional</h1>
          <p>Gestión centralizada de bienes muebles y activos fijos del SLEP</p>
        </div>
        <button className="btn-primario" onClick={() => alert('Modal de nuevo activo en construcción')}>
          <Plus size={20} />
          Registrar Activo
        </button>
      </div>

      <div className="activos-toolbar">
        <div className="search-box">
          <Search size={20} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Buscar por código patrimonial o descripción..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>}

      <div className="table-container">
        <table className="activos-table">
          <thead>
            <tr>
              <th>Cód. Patrimonial</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Valoración</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px'}}>Cargando inventario...</td></tr>
            ) : activosFiltrados.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px'}}>No se encontraron activos registrados</td></tr>
            ) : (
              activosFiltrados.map((activo) => (
                <tr key={activo.id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-primario)' }}>
                    {activo.codigo_patrimonial}
                  </td>
                  <td>
                    <strong>{activo.descripcion}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                      Ubicación ID: {activo.ubicacion_id}
                    </div>
                  </td>
                  <td>{activo.categoria}</td>
                  <td style={{ fontWeight: 600 }}>
                    ${activo.valor?.toLocaleString('es-CL') || 0}
                  </td>
                  <td>
                    <span className={`badge ${activo.estado_conservacion.toLowerCase()}`}>
                      {activo.estado_conservacion}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-accion" title="Editar Activo">
                      <Edit size={18} />
                    </button>
                    <button className="btn-accion" title="Dar de Baja" style={{ color: '#ef4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}