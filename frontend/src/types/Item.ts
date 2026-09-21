export interface Item {
  id: number;
  sku: string;
  modelo: string| null;
  estado: string;
  lab: string| null;
  nombre_familia: string| null;
  tipo: string| null;
  cantidad: number| 100;
  codigo_utalca?: string | null;
  codigo_serie?: string | null;
  descripcion: string| null;
  refer_image?: string | null;
}
