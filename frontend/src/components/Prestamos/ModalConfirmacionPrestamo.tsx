import { useState, useEffect } from "react";
import type { Item } from "../../types/Item";

interface PedidoItem {
  item: Item;
  cantidad: number;
}

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pedido: PedidoItem[];
  motivo: string;
  setMotivo: (motivo: string) => void;
  enviando?: boolean;
  errorEnvio?: string;
}

export default function ModalConfirmacionPrestamo({
  isOpen,
  onClose,
  onConfirm,
  pedido,
  motivo,
  setMotivo,
  enviando = false,
  errorEnvio = "",
}: Readonly<ModalConfirmacionProps>) {
  
  const [contador, setContador] = useState(5);
  const [puedoConfirmar, setPuedoConfirmar] = useState(false);

  // Lógica del contador cada vez que se abre el modal
  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setContador(5);
      setPuedoConfirmar(false);
      timer = setInterval(() => {
        setContador((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPuedoConfirmar(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-contenido" style={{ maxWidth: '500px' }}>
        <h2 style={{ color: 'var(--color-primario)', marginBottom: '10px', textAlign: 'center' }}>Confirmación de Préstamo</h2>
        <p style={{ textAlign: 'center', marginBottom: '15px' }}>
          Revisa bien las cantidades. La fecha de devolución será asignada por un administrador.
        </p>
        
        {/* Lista visual de equipos */}
        <ul style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', listStyle: 'none' }}>
          {pedido.map(p => (
            <li key={p.item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span>{p.item.modelo}</span>
              <strong>x{p.cantidad}</strong>
            </li>
          ))}
        </ul>

        {/* Formulario (SIN FECHA) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', textAlign: 'left' }}>
          <div className="input-field">
            <label htmlFor="motivo" style={{ fontSize: '0.85rem', color: '#64748b' }}>Motivo del Préstamo *</label>
            <input 
              type="text" 
              id="motivo" 
              value={motivo} 
              onChange={(e) => setMotivo(e.target.value)} 
              placeholder="Ej: Taller de Programación..." 
              className="campo-input" 
              disabled={enviando}
              required 
            />
          </div>
        </div>

        {errorEnvio && (
          <p className="error-msg" style={{ marginBottom: '15px' }}>
            {errorEnvio}
          </p>
        )}

        {/* Botonera con el contador */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-cancelar" style={{ flex: 1 }} onClick={onClose} disabled={enviando}>Volver</button>
          <button 
            className="btn-guardar" 
            style={{ flex: 1, opacity: puedoConfirmar && motivo.trim() && !enviando ? 1 : 0.6 }} 
            onClick={onConfirm}
            disabled={!puedoConfirmar || !motivo.trim() || enviando}
          >
            {enviando ? "Enviando..." : puedoConfirmar ? "Confirmar Solicitud" : `Revisando... (${contador}s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
