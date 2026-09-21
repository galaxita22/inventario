export interface Componente {
  id: number;
  sku: string;
  modelo: string;
  cantidad: number;        
  stock_critico: number;   
  lab_id: number;          
  descripcion?: string;    
}