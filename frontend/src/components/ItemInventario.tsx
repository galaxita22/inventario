import type { Item } from "../types/Item";
import "../styles/Style-item-inventario.css";
import noImage from "../assets/no_image.png";

interface ItemInventarioProps {
  item: Item;
  onClick?: () => void;
}

function ItemInventario({ item, onClick }: ItemInventarioProps) {
  const stockClass = item.cantidad > 0 ? "normal" : "critico";
  const stockLabel = item.cantidad > 0 ? "Disponible" : "Sin stock";

  return (
    <article className="item-inventario">
      <button type="button" className="item-inventario-toggle" onClick={onClick}>
        <div className="item-inventario-imagen-container">
          <img
            src={item.refer_image || noImage}
            alt={item.modelo}
            className="item-inventario-imagen"
            onError={(e) => {
              e.currentTarget.src = noImage;
            }}
          />
        </div>

        <div className="item-inventario-contenido">
          <div className="item-info-grupo">
            <span className="item-info-etiqueta">Modelo</span>
            <p className="item-dato-nombre">{item.modelo}</p>
          </div>
          <div className="item-info-grupo">
            <span className="item-info-etiqueta">SKU</span>
            <p>{item.sku}</p>
          </div>
          <div className="item-info-grupo">
            <span className="item-info-etiqueta">Laboratorio</span>
            <p>{item.lab}</p>
          </div>
          <div className="item-info-grupo">
            <span className="item-info-etiqueta">Cantidad</span>
            <p className={`item-dato-cantidad ${stockClass}`}>{item.cantidad}</p>
          </div>
          <span className={`item-estado-stock ${stockClass}`}>{stockLabel}</span>
        </div>
      </button>
    </article>
  );
}

export default ItemInventario;
