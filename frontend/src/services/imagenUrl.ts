const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Construye la URL completa de la imagen de un componente a partir de imagen_ref.
// Soporta los tres formatos que existen en la BD:
// - "/uploads/archivo.png" (subida manual)
// - "/uploads/productos/archivo.png" (importación por ZIP)
// - "archivo.png" (registros antiguos importados por ZIP, sin ruta)
export function construirUrlImagen(imagenRef?: string | null): string | null {
  if (!imagenRef) {
    return null;
  }

  if (/^https?:\/\//i.test(imagenRef)) {
    return imagenRef;
  }

  if (imagenRef.startsWith("/uploads")) {
    return `${BACKEND_URL}${imagenRef}`;
  }

  return `${BACKEND_URL}/uploads/productos/${imagenRef}`;
}
