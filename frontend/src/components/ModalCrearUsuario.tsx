import { useState, useEffect } from 'react';
import './ModalCrearUsuario.css';

interface ModalCrearUsuarioProps {
  abierto: boolean;
  onCerrar: () => void;
  onUsuarioCreado?: () => void; // Callback para refrescar la lista después de crear
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

export default function ModalCrearUsuario({ abierto, onCerrar, onUsuarioCreado }: ModalCrearUsuarioProps) {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    email: '',
    rut: '',
    escuela: '',
    matricula: '',
    role: 'comun',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validarEmail = (email: string): boolean => {
    const emailLimpio = email.trim().toLowerCase();
    const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio);
    const dominiosPermitidos = ['gmail.com', 'alumnos.utalca.cl', 'utalca.cl'];
    const dominio = emailLimpio.split('@')[1];

    return formatoValido && dominiosPermitidos.includes(dominio);
  };

  // Función para validar RUT chileno
  const validarRut = (rut: string): boolean => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
    const dv = rutLimpio.slice(-1).toLowerCase();
    const cuerpo = rutLimpio.slice(0, -1);
    if (!/^\d+$/.test(cuerpo) || /^(\d)\1+$/.test(cuerpo)) return false;
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'k' : dvEsperado.toString();
    return dv === dvCalculado;
  };

  useEffect(() => {
    if (!abierto) {
      // Resetear formulario al cerrar
      setFormData({
        nombre_usuario: '',
        email: '',
        rut: '',
        escuela: '',
        matricula: '',
        role: 'comun',
      });
      setErrors({});
    }
  }, [abierto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nuevoValor = name === 'matricula' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setFormData(prev => ({ ...prev, [name]: nuevoValor }));
    // Limpiar error del campo al cambiar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!formData.nombre_usuario.trim()) nuevosErrores.nombre_usuario = 'El nombre es obligatorio.';
    if (!formData.email.trim()) nuevosErrores.email = 'El correo es obligatorio.';
    else if (!validarEmail(formData.email)) nuevosErrores.email = 'Solo se permiten correos @gmail.com, @alumnos.utalca.cl o @utalca.cl.';
   if (!formData.rut.trim()) nuevosErrores.rut = 'El RUT es obligatorio.';
    else if (!validarRut(formData.rut)) nuevosErrores.rut = 'RUT inválido.';
    if (!formData.escuela.trim()) nuevosErrores.escuela = 'La escuela es obligatoria.';
    if (formData.matricula.trim() && !/^\d{10}$/.test(formData.matricula)) nuevosErrores.matricula = 'La matricula debe tener exactamente 10 numeros.';

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validarFormulario()) {
      setLoading(false);
      return;
    }

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ general: 'No estás autenticado.' });
        setLoading(false);
        return;
      }

      const dataToSend = {
        nombre_usuario: formData.nombre_usuario,
        email: formData.email,
        rut: formData.rut,
        escuela: formData.escuela,
        matricula: formData.matricula,
        role: formData.role,
      };

      const response = await fetch(`${BACKEND_URL}/api/accounts/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el usuario');
      }

      alert('Usuario creado exitosamente');
      onCerrar();
      if (onUsuarioCreado) onUsuarioCreado();
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!abierto) return null;

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div
        className="modal-crear-usuario"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Crear usuario</h2>

        <form className="form-crear-usuario" onSubmit={handleSubmit}>
          <div className="fila">
            <div className="campo">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre_usuario"
                placeholder="Ej: Juan Pérez"
                value={formData.nombre_usuario}
                onChange={handleChange}
              />
              {errors.nombre_usuario && <span className="error-campo">{errors.nombre_usuario}</span>}
            </div>

            <div className="campo">
              <label>Correo *</label>
              <input
                type="email"
                name="email"
                placeholder="usuario@utalca.cl"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-campo">{errors.email}</span>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>RUT *</label>
              <input
                type="text"
                name="rut"
                placeholder="12345678-9"
                value={formData.rut}
                onChange={handleChange}
                maxLength={10}
              />
              {errors.rut && <span className="error-campo">{errors.rut}</span>}
            </div>

            <div className="campo">
              <label>Escuela *</label>
              <select
                name="escuela"
                value={formData.escuela}
                onChange={handleChange}
              >
                <option value="">Selecciona una escuela</option>
                {escuelas.map((escuela) => (
                  <option key={escuela} value={escuela}>
                    {escuela}
                  </option>
                ))}
              </select>
              {errors.escuela && <span className="error-campo">{errors.escuela}</span>}
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Matrícula</label>
              <input
                type="text"
                name="matricula"
                inputMode="numeric"
                maxLength={10}
                placeholder="10 numeros (opcional)"
                value={formData.matricula}
                onChange={handleChange}
              />
              {errors.matricula && <span className="error-campo">{errors.matricula}</span>}
            </div>

            <div className="campo">
              <label>Rol</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="comun">Usuario común</option>
                <option value="profesional">Profesional</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          </div>

          {errors.general && <p className="error">{errors.general}</p>}

          <div className="acciones">
            <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={loading}>
              Cancelar
            </button>

            <button type="submit" className="btn-crear" disabled={loading}>
              {loading ? 'Creando...' : 'Crear cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
