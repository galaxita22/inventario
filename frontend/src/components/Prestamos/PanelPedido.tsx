import { useState } from "react";
import type { Item } from "../../types/Item";
import ModalConfirmacionPrestamo from "./ModalConfirmacionPrestamo";

interface PedidoItem {
  item: Item;
  cantidad: number;
}

interface PanelPedidoProps {
  pedido: PedidoItem[];
  quitarDelPedido: (id: number) => void;
  actualizarCantidadPedido: (id: number, cantidad: number) => void;
  vaciarPedido: () => void;
  onConfirmarExitoso: () => void;
}

export default function PanelPedido({
  pedido,
  quitarDelPedido,
  actualizarCantidadPedido,
  vaciarPedido,
  onConfirmarExitoso
}: Readonly<PanelPedidoProps>) {
  
  const [showModal, setShowModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

const authHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Debes iniciar sesión para solicitar un préstamo.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const requestJson = async <T,>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "No se pudo completar la solicitud.");
  }

  return data as T;
};

const handleConfirmarFinal = async () => {
  setErrorEnvio("");
  setEnviando(true);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  try {
    const headers = authHeaders();

    const prestamo = await requestJson<{ id: number }>(`${BACKEND_URL}/api/prestamo/add`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        motivo: motivo.trim(),
      }),
    });

    await Promise.all(
      pedido.map((p) =>
        requestJson(`${BACKEND_URL}/api/detalle-prestamo/add`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            id_prestamo: prestamo.id,
            id_componente: p.item.id,
            cantidad: p.cantidad,
          }),
        })
      )
    );

    await requestJson(`${BACKEND_URL}/api/prestamo/update/${prestamo.id}/estado`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ estado: "pendiente" }),
    });

    localStorage.removeItem("pedido_temporal_usuario");
    localStorage.removeItem("mock_prestamos_usuario");

    setShowModal(false);
    setMotivo("");
    onConfirmarExitoso();
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar el préstamo.";
    setErrorEnvio(message);
  } finally {
    setEnviando(false);
  }
};


  return (
    <>
      <aside className="inventario-pedido card-inventario">
        <h2 className="titulo-seccion">Tu Pedido</h2>
        <p className="pedido-contador" style={{ color: '#64748b', marginBottom: '15px' }}>
          {pedido.length} unidad(es) en tu pedido
        </p>
        
        {pedido.length === 0 ? (
          <p className="admin-vacio">Selecciona un ítem de la lista para añadirlo a tu pedido.</p>
        ) : (
          <div className="lista-pedido" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {pedido.map(p => (
              <div key={p.item.id} className="item-pedido" style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primario)' }}>{p.item.modelo}</span>
                  <button onClick={() => quitarDelPedido(p.item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>❌</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Cant:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={p.item.cantidad}
                    value={p.cantidad} 
                    onChange={(e) => actualizarCantidadPedido(p.item.id, parseInt(e.target.value) || 1)}
                    className="campo-input"
                    style={{ width: '60px', padding: '4px' }}
                  />
                </div>
              </div>
            ))}
            
            {errorEnvio && (
              <p className="error-msg" style={{ margin: 0 }}>
                {errorEnvio}
              </p>
            )}

            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button className="btn-cancelar" style={{ flex: 1 }} onClick={vaciarPedido}>Vaciar</button>
              <button className="boton-primario" style={{ flex: 2 }} onClick={() => setShowModal(true)}>Solicitar</button>
            </div>
          </div>
        )}
      </aside>

      <ModalConfirmacionPrestamo 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmarFinal}
        pedido={pedido}
        motivo={motivo}
        setMotivo={setMotivo}
        enviando={enviando}
        errorEnvio={errorEnvio}
      />
    </>
  );
}
