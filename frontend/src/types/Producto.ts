export interface Producto {
  id: number;
  sku: string;
  lab_id: number;
  lab?: string;
  familia?: string;
  nombre_familia?: string;
  modelo: string;
  tipo: string;
  cantidad: number;
  codigo_utalca?: string | null;
  numero_serial?: string | null;
  codigo_serie?: string | null;
  imagen_ref?: string | null;
  refer_imagen?: string | null;
  descripcion?: string | null;
}

export interface Lab {
  id: number;
  nombre: string;
}
