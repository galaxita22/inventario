import { type Producto } from "../types/Producto";
import noImage from "../assets/no_image.png";
import "../styles/AdminInventario.css";

interface AdminDetalleInventarioModalProps {
  item: Producto | null;
  onClose: () => void;
  onEdit: (item: Producto) => void;
  onDelete: (id: number) => void;
}

export default function AdminDetalleInventarioModal({
  item,
  onClose,
  onEdit,
  onDelete,
}: AdminDetalleInventarioModalProps) {
  if (!item) return null;

  const stockClass = item.cantidad < 5 ? "critico" : "normal";
  const labNombre = item.lab?.trim() || "";

  return (
    <div className="modal-detail-overlay" onClick={onClose}>
      <div className="modal-detail-contenedor" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-cerrar" onClick={onClose}>
          ✕
        </button>

        <div className="modal-contenido-inventario">
          <div className="modal-imagen-container">
            <img
              src={item.refer_imagen || noImage}
              alt={item.modelo}
              className="modal-imagen"
              onError={(e) => {
                e.currentTarget.src = noImage;
              }}
            />
          </div>

          <div className="modal-detalles">
            <h2>{item.modelo}</h2>

            <div className="detalles-grid">
              <div className="info-grupo">
                <span className="info-etiqueta">SKU</span>
                <p>{item.sku}</p>
              </div>
              <div className="info-grupo">
                <span className="info-etiqueta">Cantidad</span>
                <p className={`dato-cantidad ${stockClass}`}>{item.cantidad}</p>
              </div>
              <div className="info-grupo">
                <span className="info-etiqueta">Estado</span>
                <span className={`estado-stock ${stockClass}`}>
                  {item.cantidad < 5 ? "Crítico" : "Disponible"}
                </span>
              </div>
              <div className="info-grupo">
                <span className="info-etiqueta">Laboratorio</span>
                <p>{labNombre || "No asignado"}</p>
              </div>
              <div className="info-grupo">
                <span className="info-etiqueta">Nombre / Familia</span>
                <p>{item.nombre_familia || "No especificada"}</p>
              </div>
              <div className="info-grupo">
                <span className="info-etiqueta">Tipo</span>
                <p>{item.tipo || "No especificado"}</p>
              </div>
              <div className="info-grupo">
                <span className="info-etiqueta">Código UTalca</span>
                <p>{item.codigo_utalca || "No disponible"}</p>
              </div>
              <div className="info-grupo">
                <span className="info-etiqueta">Código Serie</span>
                <p>{item.codigo_serie || "No disponible"}</p>
              </div>
            </div>

            <div className="info-grupo descripcion-full">
              <span className="info-etiqueta">Descripción</span>
              <p>{item.descripcion || "No disponible"}</p>
            </div>
          </div>
        </div>

        <div className="card-acciones modal-acciones">
          <button
            type="button"
            className="btn-editarInv"
            onClick={() => {
              onEdit(item);
              onClose();
            }}
          >
            Editar Equipo
          </button>
          <button
            type="button"
            className="btn-eliminar"
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
          >
            Eliminar Equipo
          </button>
        </div>
      </div>
    </div>
  );
}
