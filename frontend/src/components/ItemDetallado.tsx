import { useEffect, useMemo, useState } from "react";
import type { Item } from "../types/Item";
import "../styles/Style-item-detallado.css";
import noImage from "../assets/no_image.png";

interface ItemDetalladoProps {
	item: Item | null;
	onClose: () => void;
	onAddToPedido?: (item: Item, cantidad: number) => void;
	isLoggedIn?: boolean;
	cantidadEnPedido?: number;
}

function renderValue(value?: string | null) {
	return value && value.trim().length > 0 ? value : "No disponible";
}

export default function ItemDetallado({
	item,
	onClose,
	onAddToPedido,
	isLoggedIn = false,
	cantidadEnPedido = 0,
}: Readonly<ItemDetalladoProps>) {
	const [cantidad, setCantidad] = useState(1);

	useEffect(() => {
		setCantidad(1);
	}, [item?.id]);

	const stockDisponible = useMemo(() => {
		if (!item) {
			return 0;
		}

		return Math.max(item.cantidad - cantidadEnPedido, 0);
	}, [cantidadEnPedido, item]);

	const puedeAgregar = isLoggedIn && stockDisponible > 0;

	if (!item) {
		return null;
	}

	return (
		<dialog className="item-detallado-overlay" open>
			<button
				type="button"
				className="item-detallado-backdrop"
				onClick={onClose}
				aria-label="Cerrar detalle"
			/>
			<article
				className="item-detallado-modal"
				aria-labelledby="item-detallado-titulo"
			>
				<button className="item-detallado-close" onClick={onClose} aria-label="Cerrar detalle">
					×
				</button>

				<header className="item-detallado-header">
					<h2 id="item-detallado-titulo">{item.modelo}</h2>
					<span className="item-detallado-badge">{renderValue(item.tipo)}</span>
				</header>

				<div className="item-detallado-content">
					<img
						className="item-detallado-image"
						src={item.refer_image || noImage}
						alt={item.modelo}
					/>

					<div className="item-detallado-grid">
						<p><strong>SKU:</strong> {item.sku}</p>
						<p><strong>Modelo:</strong> {renderValue(item.modelo)}</p>
						<p><strong>Laboratorio:</strong> {renderValue(item.lab)}</p>
						<p><strong>Familia:</strong> {renderValue(item.nombre_familia)}</p>
						<p><strong>Stock:</strong> {item.cantidad}</p>
						<p><strong>Estado:</strong> {item.estado}</p>
						<p><strong>Codigo UTalca:</strong> {renderValue(item.codigo_utalca)}</p>
						<p><strong>Codigo Serie:</strong> {renderValue(item.codigo_serie)}</p>
						<p className="item-detallado-descripcion">
							<strong>Descripcion:</strong> {renderValue(item.descripcion)}
						</p>
					</div>
				</div>
                <div className="item-detallado-bottom">
					<div
						className={`item-detallado-warning ${puedeAgregar ? "item-detallado-warning-ok" : ""}`}
					>
						{!isLoggedIn && "Debes iniciar sesion para hacer solicitudes."}
						{isLoggedIn && stockDisponible === 0 && "No hay stock disponible para tu pedido."}
						{isLoggedIn && stockDisponible > 0 && `Disponible para pedir: ${stockDisponible}`}
					</div>
                    <div className="item-detallado-controls">
                        <input 
                            className="item-detallado-cantidad" 
                            type="number" 
                            min="1" 
                            max={Math.max(stockDisponible, 1)} 
							value={cantidad}
							onChange={(event) => {
								const value = Number(event.target.value);

								if (Number.isNaN(value) || value < 1) {
									setCantidad(1);
									return;
								}

								setCantidad(Math.min(value, Math.max(stockDisponible, 1)));
							}}
							disabled={!puedeAgregar}
                        />
						<button
							className="item-detallado-boton"
							disabled={!puedeAgregar}
							onClick={() => {
								if (!puedeAgregar) {
									return;
								}

								onAddToPedido?.(item, cantidad);
							}}
						>
							Agregar al pedido
						</button>
                    </div>
                </div>
			</article>
		</dialog>
	);
}

