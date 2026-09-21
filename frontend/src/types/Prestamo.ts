// Definimos los tipos de estado como "Union Types"
export type EstadoPrestamo = 
  | "Pendiente" 
  | "Aprobada" 
  | "Rechazada" 
  | "Devuelto" 
  | "Modificada" 
  | "Atrasado" 
  | "Cancelada" 
  | "Retirado";

export type EstadoItem = "retirado" | "devuelto" | "pendiente";

export interface PrestamoItem {
  detalleId?: number;
  componenteId?: number;
  sku: string;
  modelo: string;
  cantidad: number;
  cantidad_devuelta?: number;
  lab: string;
  estado?: EstadoItem;

}

export interface UsuarioDetalles {
  nombre: string;
  correo: string;
  rut: string;
  matricula: string;
  carrera: string;
}

export interface Prestamo {
  id: number;
  usuario: string; 
  usuarioId?: number;
  usuarioEmail?: string;
  usuarioDetalles?: UsuarioDetalles; 
  adminAprobador?: string; 
  fechaSolicitud: string;
  fechaEstimadaDevolucion: string;
  motivo: string;
  motivoRechazo?: string;
  estado?: EstadoPrestamo;
  items: PrestamoItem[];
}