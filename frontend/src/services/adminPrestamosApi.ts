import type { EstadoItem, Prestamo } from "../types/Prestamo";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface BackendPrestamo {
  id: number;
  id_usuario: number;
  codigo_peticion?: string | null;
  fecha_peticion?: string | null;
  fecha_retiro?: string | null;
  fecha_estimada_devolucion?: string | null;
  fecha_devolucion?: string | null;
  estado: string;
  motivo_rechazo?: string | null;
}

interface BackendDetallePrestamo {
  id: number;
  id_prestamo: number;
  id_componente: number;
  cantidad: number;
  estado?: string;
  cantidad_devuelta?: number;
}

interface BackendUsuario {
  id: number;
  nombre_usuario: string;
  email: string;
  rut?: string | null;
  matricula?: string | null;
  escuela?: string | null;
}

interface BackendComponente {
  id: number;
  sku: string;
  lab_id: number;
  modelo: string;
}

interface BackendLab {
  id: number;
  nombre: string;
}

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No hay sesión activa.");
  }
  return token;
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

const requestJson = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
  const fetchOptions: RequestInit = {
    cache: "no-store",//le cambié esto pq fallaba al mostrar los prestamos de usuario comun, no se si es la mejor solucion pero es la única que encontré :(
    ...options,
  };

  const response = await fetch(url, fetchOptions);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Error al conectar con el backend.");
  }

  return data as T;
};

const estadoBackendToUi = (estado: string): Prestamo["estado"] => {
  const normalizado = estado.toLowerCase();

  if (normalizado === "aprobado") return "Aprobada";
  if (normalizado === "rechazado") return "Rechazada";
  if (normalizado === "devuelto") return "Devuelto";
  if (normalizado === "negociacion") return "Modificada";
  if (normalizado === "atrasado") return "Atrasado";
  if (normalizado === "retirado") return "Retirado";
  return "Pendiente";
};

const estadoDetalleBackendToUi = (estado?: string | null): EstadoItem => {
  const normalizado = estado?.toLowerCase();

  if (normalizado === "retirado") return "retirado";
  if (normalizado === "devuelto") return "devuelto";
  return "pendiente";
};

export const estadoUiToBackend = (estado: Prestamo["estado"]) => {
  if (estado === "Aprobada") return "aprobado";
  if (estado === "Rechazada") return "rechazado";
  if (estado === "Devuelto") return "devuelto";
  if (estado === "Modificada") return "negociacion";
  if (estado === "Atrasado") return "atrasado";
  if (estado === "Retirado") return "retirado";
  return "pendiente";
};

export const actualizarFechaPrestamo = async (idPrestamo: number, nuevaFecha: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/prestamo/${idPrestamo}/fecha`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nuevaFecha })
  });
  if (!response.ok) throw new Error('Error al actualizar fecha');
  return response.json();
};

export const procesarDevolucionParcial = async (idPrestamo: number, detalleId: number, cantidadDevuelta: number) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/prestamo/${idPrestamo}/devolucion-parcial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ detalleId, cantidadDevuelta })
  });
  if (!response.ok) throw new Error('Error en la devolución');
  return response.json();
};

const mapearPrestamos = async (prestamos: BackendPrestamo[], usuarios: BackendUsuario[]) => {
  const [componentes, labs] = await Promise.all([
    requestJson<BackendComponente[]>(`${API_URL}/api/component/all`),
    requestJson<BackendLab[]>(`${API_URL}/api/lab/all`),
  ]);

  const detallesPorPrestamo = await Promise.all(
    prestamos.map(async (prestamo) => ({
      prestamoId: prestamo.id,
      detalles: await requestJson<BackendDetallePrestamo[]>(
        `${API_URL}/api/detalle-prestamo/prestamo/${prestamo.id}`,
        { headers: authHeaders() }
      ),
    }))
  );

  const usuariosPorId = new Map(usuarios.map((usuario) => [usuario.id, usuario]));
  const componentesPorId = new Map(componentes.map((componente) => [componente.id, componente]));
  const labsPorId = new Map(labs.map((lab) => [lab.id, lab.nombre]));
  const detallesMap = new Map(detallesPorPrestamo.map((entry) => [entry.prestamoId, entry.detalles]));

  return prestamos
    .map((prestamo) => {
      const usuario = usuariosPorId.get(prestamo.id_usuario);
      const detalles = detallesMap.get(prestamo.id) || [];

      // revisa el estado del prestamo, si es aprobado y la fecha de devolución estimada ya pasó, lo marca como atrasado
      let estadoCalculado = estadoBackendToUi(prestamo.estado);

      if (estadoCalculado === "Aprobada" && prestamo.fecha_estimada_devolucion) {
        const fechaDev = new Date(`${prestamo.fecha_estimada_devolucion}T00:00:00`);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Compara el inicio del día

        if (fechaDev < hoy) {
          estadoCalculado = "Atrasado";
        }
      }

      return {
        id: prestamo.id,
        usuarioId: prestamo.id_usuario,
        usuario: usuario?.nombre_usuario || `Usuario ${prestamo.id_usuario}`,
        usuarioEmail: usuario?.email || "N/A",
        usuarioDetalles: {
          nombre: usuario?.nombre_usuario || `Usuario ${prestamo.id_usuario}`,
          correo: usuario?.email || "N/A",
          rut: usuario?.rut || "N/A",
          matricula: usuario?.matricula || "N/A",
          carrera: usuario?.escuela || "N/A",
        },
        fechaSolicitud: prestamo.fecha_peticion || "Sin fecha",
        fechaEstimadaDevolucion: prestamo.fecha_estimada_devolucion || "Por definir por Administrador",
        motivo: prestamo.codigo_peticion ? `Código ${prestamo.codigo_peticion}` : "Solicitud de préstamo",
        motivoRechazo: prestamo.motivo_rechazo || undefined,
        
        estado: estadoCalculado, 
        
        items: detalles.map((detalle) => {
          const componente = componentesPorId.get(detalle.id_componente);
          return {
            detalleId: detalle.id,
            componenteId: detalle.id_componente,
            sku: componente?.sku || `COMP-${detalle.id_componente}`,
            modelo: componente?.modelo || `Componente ${detalle.id_componente}`,
            cantidad: detalle.cantidad,
            lab: componente
              ? labsPorId.get(componente.lab_id) || "General"
              : "Sin área",
            estado: estadoDetalleBackendToUi(detalle.estado) as any,
            cantidad_devuelta: detalle.cantidad_devuelta || 0,
          };
        }),
      };
    })
    .sort((a, b) => b.id - a.id);
};

export const actualizarEstadoDetalle = async (detalleId: number, estado: string) => {
  return requestJson(`${API_URL}/api/detalle-prestamo/update/${detalleId}/estado`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ estado }),
  });
};

export const cargarPrestamosAdmin = async (): Promise<Prestamo[]> => {
  const [prestamos, usuarios] = await Promise.all([
    requestJson<BackendPrestamo[]>(`${API_URL}/api/prestamo/all`, {
      headers: authHeaders(),
    }),
    requestJson<BackendUsuario[]>(`${API_URL}/api/accounts`, {
      headers: authHeaders(),
    }),
  ]);
  
  return mapearPrestamos(prestamos, usuarios);
};

export const cargarPrestamosUsuario = async (): Promise<Prestamo[]> => {
  const userRaw = localStorage.getItem("user");

  if (!userRaw) {
    throw new Error("No se pudo identificar al usuario actual.");
  }

  const usuarioActual = JSON.parse(userRaw) as BackendUsuario;
  const prestamos = await requestJson<BackendPrestamo[]>(`${API_URL}/api/prestamo/user/${usuarioActual.id}`, {
    headers: authHeaders(),
  });

  return mapearPrestamos(prestamos, [usuarioActual]);
};

export const actualizarEstadoPrestamo = async (prestamo: Prestamo) => {
  const fechaEstimada =
    prestamo.fechaEstimadaDevolucion &&
    prestamo.fechaEstimadaDevolucion !== "Por definir por Administrador"
      ? prestamo.fechaEstimadaDevolucion
      : null;

  return requestJson(`${API_URL}/api/prestamo/update/${prestamo.id}/estado`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      estado: estadoUiToBackend(prestamo.estado),
      fecha_estimada_devolucion: fechaEstimada,
      motivo_rechazo: prestamo.motivoRechazo || null,
    }),
  });
};

export const actualizarDetallesPrestamo = async (prestamo: Prestamo) => {
  const detallesBD = await requestJson<BackendDetallePrestamo[]>(
    `${API_URL}/api/detalle-prestamo/prestamo/${prestamo.id}`,
    { headers: authHeaders() }
  );

  const idsEnBD = detallesBD.map(d => d.id);
  const idsSobrevivientes = prestamo.items.filter(item => item.detalleId).map(item => item.detalleId);

  const idsAEliminar = idsEnBD.filter(id => !idsSobrevivientes.includes(id));

  const promesasUpdate = prestamo.items
    .filter((item) => item.detalleId)
    .map((item) =>
      requestJson(`${API_URL}/api/detalle-prestamo/update/${item.detalleId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ cantidad: item.cantidad }),
      })
    );

  const promesasInsert = prestamo.items
    .filter((item) => !item.detalleId)
    .map((item) =>
      requestJson(`${API_URL}/api/detalle-prestamo/add`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id_prestamo: prestamo.id,
          id_componente: item.componenteId,
          cantidad: item.cantidad,
        }),
      })
    );

  const promesasDelete = idsAEliminar.map((id) =>
    requestJson(`${API_URL}/api/detalle-prestamo/delete/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
  );

  await Promise.all([...promesasUpdate, ...promesasInsert, ...promesasDelete]);
};