import { type Lab, type Producto } from "../types/Producto";

interface FormProductoModalProps {
  showForm: boolean;
  editingProduct: Producto | null;
  formError: string;
  guardando: boolean;
  laboratorios: Lab[];
  onClose: () => void;
  onSubmit: (form: HTMLFormElement) => void;
}

export default function FormProductoModal({
  showForm,
  editingProduct,
  formError,
  guardando,
  laboratorios,
  onClose,
  onSubmit,
}: FormProductoModalProps) {
  if (!showForm) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <dialog className="modal-overlay" open>
      <button
        type="button"
        className="modal-backdrop"
        onClick={handleClose}
        aria-label="Cerrar formulario"
      />
      <section className="modal-contenido">
        <h2>{editingProduct ? `Editando: ${editingProduct.modelo}` : "Nuevo equipo"}</h2>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(event.currentTarget);
          }}
        >
          <div className="input-field">
            <label htmlFor="sku">SKU *</label>
            <input
              id="sku"
              name="sku"
              type="text"
              required
              defaultValue={editingProduct?.sku || ""}
            />
          </div>

          <div className="input-field">
            <label htmlFor="lab_id">Área *</label>
            <select
              id="lab_id"
              name="lab_id"
              required
              className="select-personalizado"
              defaultValue={editingProduct?.lab_id ? String(editingProduct.lab_id) : ""}
            >
              <option value="" disabled>
                Seleccione un área...
              </option>
              {laboratorios.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="input-field">
            <label htmlFor="familia">Familia *</label>
            <input
              id="familia"
              name="familia"
              type="text"
              required
              defaultValue={editingProduct?.familia || editingProduct?.nombre_familia || ""}
            />
          </div>

          <div className="input-field">
            <label htmlFor="modelo">Modelo *</label>
            <input
              id="modelo"
              name="modelo"
              type="text"
              required
              defaultValue={editingProduct?.modelo || ""}
            />
          </div>

          <div className="input-field">
            <label htmlFor="tipo">Tipo *</label>
            <select
              id="tipo"
              name="tipo"
              required
              className="select-personalizado"
              defaultValue={editingProduct?.tipo || ""}
            >
              <option value="" disabled>Seleccione...</option>
              <option value="Herramienta">Herramienta</option>
              <option value="Equipo">Equipo</option>
              <option value="Fungible">Fungible</option>
            </select>
          </div>

          <div className="input-field">
            <label htmlFor="cantidad">Cantidad *</label>
            <input
              id="cantidad"
              name="cantidad"
              type="number"
              min="0"
              required
              defaultValue={editingProduct?.cantidad ?? 0}
            />
          </div>

          <div className="input-field">
            <label htmlFor="codigo_utalca">Codigo UTalca *</label>
            <input
              id="codigo_utalca"
              name="codigo_utalca"
              type="text"
              required
              defaultValue={editingProduct?.codigo_utalca || ""}
            />
          </div>

          <div className="input-field">
            <label htmlFor="numero_serial">Codigo de serie *</label>
            <input
              id="numero_serial"
              name="numero_serial"
              type="text"
              required
              defaultValue={editingProduct?.numero_serial || editingProduct?.codigo_serie || ""}
            />
          </div>

          <div className="input-field">
            <label htmlFor="imagen">Imagen</label>
            <input
              id="imagen"
              name="imagen"
              type="file"
              accept="image/*"
            />
            {(editingProduct?.imagen_ref || editingProduct?.refer_imagen) && (
              <small style={{ color: "#666" }}>Si no subes nada, se mantendrá la imagen actual.</small>
            )}
          </div>

          <div className="input-field">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              placeholder="Detalle del equipo"
              defaultValue={editingProduct?.descripcion || ""}
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          {formError && <p className="error-msg error-form">{formError}</p>}

          <div className="modal-botones">
            <button
              type="button"
              className="btn-cancelar"
              onClick={handleClose}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={guardando}>
              {guardando ? "Guardando..." : editingProduct ? "Guardar Cambios" : "Guardar en BD"}
            </button>
          </div>
        </form>
      </section>
    </dialog>
  );
}
