import { useState, useEffect, useMemo } from "react";
import type { Item } from "../types/Item";

export interface PedidoItem {
  item: Item;
  cantidad: number;
}

const PEDIDO_STORAGE_KEY = "pedido_temporal_usuario";

export function usePedido() {
  const [pedido, setPedido] = useState<PedidoItem[]>([]);

  // Cargar pedido desde localStorage 
  useEffect(() => {
    const pedidoGuardado = localStorage.getItem(PEDIDO_STORAGE_KEY);
    if (pedidoGuardado) {
      try {
        setPedido(JSON.parse(pedidoGuardado));
      } catch {
        localStorage.removeItem(PEDIDO_STORAGE_KEY);
      }
    }
  }, []);

  // Persistir cambios en localStorage
  useEffect(() => {
    localStorage.setItem(PEDIDO_STORAGE_KEY, JSON.stringify(pedido));
  }, [pedido]);

  const totalUnidades = useMemo(
    () => pedido.reduce((acc, entrada) => acc + entrada.cantidad, 0),
    [pedido]
  );

  const agregarAlPedido = (item: Item, cantidadSolicitada: number) => {
    setPedido((prev) => {
      const index = prev.findIndex((p) => p.item.id === item.id);
      if (index === -1) return [...prev, { item, cantidad: cantidadSolicitada }];
      
      const actualizado = [...prev];
      actualizado[index].cantidad += cantidadSolicitada;
      return actualizado;
    });
  };

  const actualizarCantidad = (idItem: number, nuevaCantidad: number) => {
    setPedido(prev => prev.map(p => 
      p.item.id === idItem 
        ? { ...p, cantidad: Math.max(1, Math.min(nuevaCantidad, p.item.cantidad)) } 
        : p
    ));
  };

  const quitarDelPedido = (idItem: number) => {
    setPedido(prev => prev.filter(p => p.item.id !== idItem));
  };

  const vaciarPedido = () => setPedido([]);

  return { 
    pedido, 
    totalUnidades, 
    agregarAlPedido, 
    actualizarCantidad, 
    quitarDelPedido, 
    vaciarPedido 
  };
}