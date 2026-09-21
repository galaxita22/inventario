import { type Producto } from "../types/Producto";
import noImage from "../assets/no_image.png";

interface AdminItemInventarioProps {
  item: Producto;
  onView: () => void;
  onEdit: (item: Producto) => void;
  onDelete: (id: number) => void;
}

export default function AdminItemInventario({
  item,
  onView
}: AdminItemInventarioProps) {
  
  const stockClass = item.cantidad < 5 ? "critico" : "normal";

  return (
    <article className="card-inventario">

      {/* BOTÓN: Abre el modal con los detalles */}
      <button type="button" className="card-toggle" onClick={onView}>
        <div className="card-imagen-container">
          <img
            src={item.refer_imagen || noImage}
            alt={item.modelo}
            className="card-imagen"
            onError={(e) => {
              e.currentTarget.src = noImage;
            }}
          />
        </div>

        <div className="card-contenido">
          <div className="info-grupo">
            <span className="info-etiqueta">Modelo</span>
            <p className="dato-nombre">{item.modelo}</p>
          </div>
          <div className="info-grupo">
            <span className="info-etiqueta">SKU</span>
            <p>{item.sku}</p>
          </div>
          <div className="info-grupo">
            <span className="info-etiqueta">Cantidad</span>
            <p className={`dato-cantidad ${stockClass}`}>{item.cantidad}</p>
          </div>
          <span className={`estado-stock ${stockClass}`}>
            {item.cantidad < 5 ? "Crítico" : "Disponible"}
          </span>
        </div>
      </button>
    </article>
  );
}
