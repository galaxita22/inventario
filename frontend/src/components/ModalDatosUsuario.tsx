import { useState, useEffect } from 'react';
import { cargarPrestamosAdmin } from '../services/adminPrestamosApi';
import { construirUrlImagen } from '../services/imagenUrl';
import type { Prestamo } from '../types/Prestamo';
import './ModalDatosUsuario.css';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  tipo: string;
  role?: string;
  nombre_usuario?: string;
  escuela?: string;
  matricula?: string;
  avatar_ref?: string | null;
}

interface ModalDatosUsuarioProps {
  abierto: boolean;
  onCerrar: () => void;
  usuario: Usuario | null;
  onUsuarioActualizado?: () => void;
  onUsuarioEliminado?: (usuario: Usuario) => Promise<boolean | void> | boolean | void;
}

const escuelas = [
  'Ingenieria Civil en Computacion',
  'Ingenieria Civil Electrica',
  'Ingenieria Civil Mecatronica',
  'Ingenieria Civil en Obras Civiles',
  'Ingenieria Civil de Minas',
  'Ingenieria Civil Industrial',
  'Ingenieria Civil Mecanica',
];

const parseFecha = (fecha?: string | null) => {
  if (!fecha || fecha === 'Por definir por Administrador' || fecha === 'Sin fecha') return null;

  const [datePart] = fecha.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getRolTexto = (role?: string) => {
  if (role === 'administrador') return 'Administrador';
  if (role === 'profesional') return 'Profesor';
  return 'Usuario comun';
};

const getIniciales = (nombre?: string) => {
  const partes = (nombre || 'Usuario')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return partes
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('') || 'U';
};

export default function ModalDatosUsuario({
  abierto,
  onCerrar,
  usuario,
  onUsuarioActualizado,
  onUsuarioEliminado,
}: ModalDatosUsuarioProps) {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    email: '',
    contrasena: '',
    role: 'comun',
    escuela: '',
    matricula: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState<Prestamo[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState('');
  const [editando, setEditando] = useState(false);
  const [datosMinimizados, setDatosMinimizados] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre_usuario: usuario.nombre_usuario || usuario.nombre || '',
        email: usuario.email || '',
        contrasena: '',
        role: usuario.role || 'comun',
        escuela: usuario.escuela || '',
        matricula: usuario.matricula || '',
      });
      setError('');
      setEditando(false);
      setDatosMinimizados(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!abierto) {
      setEditando(false);
      setError('');
      setDatosMinimizados(false);
    }
  }, [abierto]);

  useEffect(() => {
    if (!abierto || !usuario) {
      setHistorial([]);
      setErrorHistorial('');
      return;
    }

    const cargarHistorial = async () => {
      setLoadingHistorial(true);
      setErrorHistorial('');
      setHistorial([]);

      try {
        const prestamos = await cargarPrestamosAdmin();
        setHistorial(prestamos.filter((prestamo) => prestamo.usuarioId === usuario.id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar el historial del usuario.';
        setErrorHistorial(message);
      } finally {
        setLoadingHistorial(false);
      }
    };

    void cargarHistorial();
  }, [abierto, usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editando) return;

    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const restaurarDatosUsuario = () => {
    if (!usuario) return;

    setFormData({
      nombre_usuario: usuario.nombre_usuario || usuario.nombre || '',
      email: usuario.email || '',
      contrasena: '',
      role: usuario.role || 'comun',
      escuela: usuario.escuela || '',
      matricula: usuario.matricula || '',
    });
    setError('');
    setEditando(false);
  };

  const handleGuardarCambios = async () => {
    if (!editando) return;

    setError('');
    setLoading(true);

    if (!formData.nombre_usuario.trim() || !formData.escuela.trim()) {
      setError('Nombre y escuela son obligatorios.');
      setLoading(false);
      return;
    }

    if (formData.contrasena && formData.contrasena.length < 6) {
      setError('La nueva contrasena debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No estas autenticado.');
        setLoading(false);
        return;
      }

      const updateData: any = {
        nombre_usuario: formData.nombre_usuario.trim(),
        email: formData.email,
        role: formData.role,
        escuela: formData.escuela,
        matricula: formData.matricula || null,
      };

      if (formData.contrasena) {
        updateData.contrasena = formData.contrasena;
      }

      const response = await fetch(`${BACKEND_URL}/api/accounts/${usuario?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el usuario');
      }

      alert('Usuario actualizado exitosamente');
      setEditando(false);
      onCerrar();
      if (onUsuarioActualizado) onUsuarioActualizado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!usuario || !onUsuarioEliminado) return;

    setError('');
    setLoading(true);

    try {
      const eliminado = await onUsuarioEliminado(usuario);
      if (eliminado !== false) {
        onCerrar();
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!abierto || !usuario) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const totalRegistros = historial.length;
  const totalDevueltos = historial.filter((prestamo) => prestamo.estado === 'Devuelto').length;
  const totalRechazados = historial.filter((prestamo) => prestamo.estado === 'Rechazada').length;
  const totalActivos = historial.filter(
    (prestamo) => !['Devuelto', 'Rechazada', 'Cancelada'].includes(prestamo.estado)
  ).length;
  const totalAtrasados = historial.filter((prestamo) => {
    const fechaDevolucion = parseFecha(prestamo.fechaEstimadaDevolucion);
    return prestamo.estado === 'Atrasado' || (
      prestamo.estado === 'Aprobada' &&
      fechaDevolucion !== null &&
      fechaDevolucion < hoy
    );
  }).length;
  const nombreVisible = formData.nombre_usuario || usuario.nombre || 'Usuario';
  const rolVisible = getRolTexto(formData.role);
  const activarEdicion = () => {
    setError('');
    setEditando(true);
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal-datos-usuario" onClick={(e) => e.stopPropagation()}>
        <header className="modal-usuario-hero">
          <div className="modal-usuario-avatar">
            {usuario.avatar_ref ? (
              <img src={construirUrlImagen(usuario.avatar_ref) ?? undefined} alt={nombreVisible} />
            ) : (
              getIniciales(nombreVisible)
            )}
          </div>
          <div className="modal-usuario-titulos">
            <span className={`modal-usuario-rol rol-${formData.role}`}>{rolVisible}</span>
            <h2>{nombreVisible}</h2>
            <p>{formData.email}</p>
          </div>
          <button
            type="button"
            className="btn-cerrar-modal-usuario"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
          >
            x
          </button>
        </header>

        <div className={`form-datos-usuario ${editando ? 'modo-edicion' : 'modo-lectura'}`}>
          <section className={`modal-seccion ${datosMinimizados ? 'modal-seccion-minimizada' : ''}`}>
            <div className="modal-seccion-header">
              <div>
                <h3>Datos de cuenta</h3>
                <span>
                  {editando
                    ? 'Edita los datos permitidos y guarda los cambios'
                  : 'Vista general de la cuenta y datos internos del usuario'}
                </span>
              </div>
              <div className="modal-seccion-controles">
                <span className={`estado-edicion ${editando ? 'activo' : ''}`}>
                  {editando ? 'Editando' : 'Solo lectura'}
                </span>
                <button
                  type="button"
                  className="btn-minimizar-seccion"
                  onClick={() => setDatosMinimizados((prev) => !prev)}
                  aria-expanded={!datosMinimizados}
                >
                  {datosMinimizados ? 'Mostrar' : 'Minimizar'}
                </button>
              </div>
            </div>

            {!datosMinimizados && (
              <div className="modal-seccion-contenido">
                <div className="fila">
                  <div className="campo">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre_usuario"
                      value={formData.nombre_usuario}
                      onChange={handleChange}
                      disabled={!editando || loading}
                      required
                    />
                  </div>

                  <div className="campo campo-solo-lectura">
                    <label>Correo</label>
                    <div className="valor-solo-lectura">{formData.email}</div>
                  </div>
                </div>

                <div className="fila">
                  <div className="campo">
                    <label>Nueva contrasena</label>
                    <input
                      type="password"
                      name="contrasena"
                      placeholder="Dejar vacio para no cambiar"
                      value={formData.contrasena}
                      onChange={handleChange}
                      disabled={!editando || loading}
                    />
                  </div>

                  <div className="campo">
                    <label>Escuela *</label>
                    <select
                      name="escuela"
                      value={formData.escuela}
                      onChange={handleChange}
                      disabled={!editando || loading}
                      required
                    >
                      <option value="">Selecciona una escuela</option>
                      {escuelas.map((escuela) => (
                        <option key={escuela} value={escuela}>
                          {escuela}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="datos-bloqueados">
                  <div>
                    <span>Rol</span>
                    <strong>{rolVisible}</strong>
                  </div>
                  <div>
                    <span>Matricula</span>
                    <strong>{formData.matricula || 'Sin matricula'}</strong>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="historial-usuario-modal">
            <div className="historial-modal-header">
              <div>
                <h3>Historial de prestamos</h3>
                <p>Resumen de solicitudes asociadas a esta cuenta</p>
              </div>
              <span>{loadingHistorial ? 'Cargando...' : `${totalRegistros} registro(s)`}</span>
            </div>

            {!loadingHistorial && !errorHistorial && (
              <div className="historial-modal-resumen">
                <div>
                  <span>Total</span>
                  <strong>{totalRegistros}</strong>
                </div>
                <div>
                  <span>Devueltos</span>
                  <strong>{totalDevueltos}</strong>
                </div>
                <div>
                  <span>Rechazados</span>
                  <strong>{totalRechazados}</strong>
                </div>
                <div>
                  <span>Activos</span>
                  <strong>{totalActivos}</strong>
                </div>
                <div>
                  <span>Atrasados</span>
                  <strong>{totalAtrasados}</strong>
                </div>
              </div>
            )}

            {errorHistorial && <p className="historial-modal-error">{errorHistorial}</p>}

            {!errorHistorial && loadingHistorial && (
              <p className="historial-modal-vacio">Cargando historial...</p>
            )}

            {!errorHistorial && !loadingHistorial && historial.length === 0 && (
              <p className="historial-modal-vacio">Este usuario no tiene prestamos registrados.</p>
            )}

            {!errorHistorial && !loadingHistorial && historial.length > 0 && (
              <div className="historial-modal-lista">
                {historial.map((prestamo) => (
                  <article key={prestamo.id} className="historial-modal-item">
                    <div className="historial-modal-item-header">
                      <strong>Solicitud #{prestamo.id.toString().slice(-4)}</strong>
                      <span className={`historial-modal-estado estado-${prestamo.estado.toLowerCase()}`}>
                        {prestamo.estado}
                      </span>
                    </div>
                    <p><strong>Fecha solicitud:</strong> {prestamo.fechaSolicitud}</p>
                    <p><strong>Devolucion:</strong> {prestamo.fechaEstimadaDevolucion}</p>
                    <p><strong>Motivo:</strong> {prestamo.motivo}</p>
                    <div className="historial-modal-equipos">
                      <strong>Componentes:</strong>
                      <ul>
                        {prestamo.items.map((item) => (
                          <li key={`${prestamo.id}-${item.detalleId ?? item.sku}`}>
                            {item.modelo} <strong>(x{item.cantidad})</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {error && <p className="error">{error}</p>}

          <div className="acciones">
            <button type="button" className="btn-eliminar-modal" onClick={handleEliminar} disabled={loading}>
              Eliminar usuario
            </button>

            <div className="acciones-principales">
              {editando ? (
                <>
                  <button type="button" className="btn-cancelar" onClick={restaurarDatosUsuario} disabled={loading}>
                    Cancelar edicion
                  </button>

                  <button type="button" className="btn-editar" onClick={handleGuardarCambios} disabled={loading}>
                    {loading ? 'Actualizando...' : 'Guardar cambios'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={loading}>
                    Cerrar
                  </button>

                  <button type="button" className="btn-editar" onClick={activarEdicion} disabled={loading}>
                    Editar datos
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
