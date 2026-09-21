  import { useState, useEffect, useMemo } from "react";
  import type { Prestamo, PrestamoItem } from "../../types/Prestamo";
  import { actualizarEstadoDetalle, 
          actualizarFechaPrestamo, 
          procesarDevolucionParcial } from "../../services/adminPrestamosApi";
  import "../../styles/AdminPrestamo.css";

  interface AdminPrestamoCardProps {
    prestamo: Prestamo;
    onActualizar: (prestamoActualizado: Prestamo) => void;
    onRecargar: () => void; 
  }

  interface ItemConIndice extends PrestamoItem {
    originalIndex: number;
  }

  export default function AdminPrestamoCard({ prestamo, onActualizar, onRecargar }: Readonly<AdminPrestamoCardProps>) {
    const clonarItems = (items: PrestamoItem[]): PrestamoItem[] => {
    return items.map(item => ({ ...item }));
  };
    const [isEditing, setIsEditing] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showContraofertaModal, setShowContraofertaModal] = useState(false); 

    const [editandoFecha, setEditandoFecha] = useState(false);
    const [nuevaFecha, setNuevaFecha] = useState(prestamo.fechaEstimadaDevolucion);
    const [itemADevolver, setItemADevolver] = useState<number | null>(null);
    const [cantidadParcial, setCantidadParcial] = useState<number>(1);
    const [editedItems, setEditedItems] = useState(clonarItems(prestamo.items));
    const hayCambios = useMemo(() => {
    if (editedItems.length !== prestamo.items.length) return true;

    return editedItems.some((item, index) => {
      const original = prestamo.items[index];
      return !original || item.cantidad !== original.cantidad || item.componenteId !== original.componenteId;
    });
  }, [editedItems, prestamo.items]);
    const [motivoRechazoInput, setMotivoRechazoInput] = useState(""); 
    
    const [fechaAprobacion, setFechaAprobacion] = useState(() => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + 7);
      return fecha.toISOString().split('T')[0];
    });
    
    const [fechaContraoferta, setFechaContraoferta] = useState(() => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + 7);
      return fecha.toISOString().split('T')[0];
    });

    const [mostrarBuscador, setMostrarBuscador] = useState(false);
    const [terminoBusqueda, setTerminoBusqueda] = useState("");
    const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
    const [diccionarioLabs, setDiccionarioLabs] = useState<Record<number, string>>({});
    useEffect(() => {
      setEditedItems(clonarItems(prestamo.items));
      setNuevaFecha(prestamo.fechaEstimadaDevolucion);
    }, [prestamo]);
    
    const buscarComponentes = async (termino: string) => {
      setTerminoBusqueda(termino);
      
      // Si escribe menos de 2 letras, no busca nada
      if (termino.trim().length < 2) {
        setResultadosBusqueda([]);
        return;
      }
      
      try {
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        
        const response = await fetch(`${API_URL}/api/component/search?q=${termino}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setResultadosBusqueda(data); 
        }
      } catch (error) {
        console.error("Error buscando componentes", error);
      }
    };

    useEffect(() => {
      const fetchLaboratorios = async () => {
        try {
          const token = localStorage.getItem("token");
          const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
          const response = await fetch(`${API_URL}/api/lab/all`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            const mapaLabs: Record<number, string> = {};
            data.forEach((lab: any) => {
              mapaLabs[lab.id] = lab.nombre;
            });
            setDiccionarioLabs(mapaLabs);
          }
        } catch (error) {
          console.error("Error cargando laboratorios:", error);
        }
      };

      fetchLaboratorios();
    }, []);

    const agregarNuevoItem = (comp: any) => {
      const nuevosItems = editedItems.map(i => ({ ...i })); 
      
      const indexExistente = nuevosItems.findIndex(i => i.sku === comp.sku);

      if (indexExistente >= 0) {
        nuevosItems[indexExistente] = {
          ...nuevosItems[indexExistente],
          cantidad: nuevosItems[indexExistente].cantidad + 1
        };
      } else {
        const nombreLab = diccionarioLabs[comp.lab_id] || "General";
        nuevosItems.push({
          componenteId: comp.id,
          sku: comp.sku,
          modelo: comp.modelo,
          cantidad: 1,
          lab: nombreLab, 
          originalIndex: nuevosItems.length
        } as ItemConIndice);
      }

      setEditedItems(nuevosItems);
      setTerminoBusqueda("");
      setResultadosBusqueda([]);
      setMostrarBuscador(false);
    };
    const agruparPorLab = (items: PrestamoItem[]) => {
      return items.reduce((acc, item, originalIndex) => {
        if (!acc[item.lab]) acc[item.lab] = [];
        acc[item.lab].push({ ...item, originalIndex });
        return acc;
      }, {} as Record<string, ItemConIndice[]>);
    };

    const handleCambiarCantidad = (sku: string, nuevaCantidad: number) => {
      const nuevosItems = editedItems.map((item) => {
        if (item.sku === sku) { // Buscamos por el SKU, no por índice
          return { ...item, cantidad: Math.max(0, nuevaCantidad) };
        }
        return item;
      });
      
      setEditedItems(nuevosItems.filter(i => i.cantidad > 0));
    };

    const handleEliminarItem = (sku: string) => {
      setEditedItems(prev => prev.filter(item => item.sku !== sku));
    };
    const handleEnviarContraoferta = () => {
      onActualizar({ 
        ...prestamo, 
        estado: 'Modificada', 
        items: editedItems,
        fechaEstimadaDevolucion: fechaContraoferta
      } as Prestamo);
      setIsEditing(false);
      setShowContraofertaModal(false);
    };

    const handleConfirmarRechazo = () => {
      onActualizar({ 
        ...prestamo, 
        estado: 'Rechazada', 
        motivoRechazo: motivoRechazoInput
      } as Prestamo);
      setIsRejecting(false);
    };

    const handleAprobarPrestamo = () => {
      const adminRaw = localStorage.getItem("user");
      const adminData = adminRaw ? JSON.parse(adminRaw) : null;
      onActualizar({ 
        ...prestamo, 
        estado: 'Aprobada', 
        fechaEstimadaDevolucion: fechaAprobacion,
        adminAprobador: adminData?.nombre_usuario || "Administrador" 
      } as Prestamo);
      setIsApproving(false);

      onRecargar(); 
    };

    const handleCancelarEdicion = () => {
      setIsEditing(false);
      setShowContraofertaModal(false);
      setEditedItems([...prestamo.items]);
    };

    return (
      <>
        <div className="admin-layout-doble-panel">
          <div className="admin-panel-izquierdo">
            <div className="admin-card-header">
              <div>
                <strong className="admin-card-title">Ticket #{prestamo.id.toString().slice(-4)}</strong>
                <p className="admin-card-date">Solicitado el: {prestamo.fechaSolicitud}</p>
              </div>
              <span className={`admin-card-badge ${prestamo.estado.toLowerCase()}`}> 
                {prestamo.estado}
              </span>
            </div>

            <hr className="divisor-delgado" />

            <div className="admin-card-col">
              <p><strong>Usuario solicitante:</strong> {prestamo.usuario}</p>
              <p><strong>Carrera:</strong> {prestamo.usuarioDetalles?.carrera || "N/A"}</p>
              <p><strong>Motivo inicial:</strong> {prestamo.motivo}</p>
              
              {prestamo.estado === 'Rechazada' && prestamo.motivoRechazo && (
                <p><strong>Motivo de rechazo:</strong> <span style={{ color: '#ef4444' }}>{prestamo.motivoRechazo}</span></p>
              )}

              {prestamo.estado !== 'Pendiente' && prestamo.estado !== 'Rechazada' && (
                <div style={{ marginTop: '5px', marginBottom: '5px' }}>
                  <strong>Fecha devolución pactada: </strong> 
                  {!editandoFecha ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span className="texto-critico">{prestamo.fechaEstimadaDevolucion}</span>
                      <button className="btn-mini-accion" onClick={() => setEditandoFecha(true)} title="Editar fecha">
                        ✏️
                      </button>
                    </span>
                  ) : (
                    <div className="admin-inline-edit">
                      <button 
                        className="btn-cerrar-flotante" 
                        title="Cancelar" 
                        onClick={() => {
                          setNuevaFecha(prestamo.fechaEstimadaDevolucion);
                          setEditandoFecha(false);
                        }}
                      >
                        ✖
                      </button>

                      <input 
                        type="date" 
                        className="admin-inline-input"
                        value={nuevaFecha}
                        onChange={(e) => setNuevaFecha(e.target.value)}
                      />
                      
                     <button className="btn-mini-accion guardar" title="Guardar" onClick={async () => {
                      try {
                        await actualizarFechaPrestamo(prestamo.id, nuevaFecha);
                        setEditandoFecha(false);
                        onRecargar();
                      } catch (error) {
                        console.error(error);
                      }
                    }}>✔️</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="admin-card-actions">
              {/* BOTONES NORMALES */}
              {prestamo.estado === 'Pendiente' && !isEditing && (
                <div className="admin-botones-accion" style={{ width: '100%' }}>
                  <button type="button" className="btn-guardar" onClick={() => setIsApproving(true)}>Aprobar</button>
                  <button type="button" className="btn-modificar-accion" onClick={() => setIsEditing(true)}>Modificar</button>
                  <button type="button" className="btn-rechazar-accion" onClick={() => setIsRejecting(true)}>Rechazar</button>
                </div>
              )}

              {isEditing && (
                <div className="admin-botones-accion" style={{ width: '100%' }}>
                  <button 
                    type="button" 
                    className="btn-modificar-accion" 
                    disabled={!hayCambios} 
                    onClick={() => setShowContraofertaModal(true)}
                    >
                    {hayCambios ? "Continuar (Elegir Fecha)" : "Sin cambios"}
                  </button>
                  <button type="button" className="btn-cancelar" onClick={handleCancelarEdicion}>Cancelar Edición</button>
                </div>
              )}

              {['Devuelto', 'Rechazada', 'Modificada', 'Cancelada'].includes(prestamo.estado) && !isEditing && (
                <p className="admin-texto-espera">Cerrado o en espera de respuesta del alumno.</p>
              )}
            </div>
          </div>

          <div className="admin-panel-derecho">
            <div className="admin-scroll-equipos">
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px', fontWeight: 'bold' }}>
                {isEditing ? "Ajustando inventario del pedido:" : "Artículos vinculados al ticket:"}
              </p>

              {isEditing && (
                <div className="admin-buscador-container">
                  {!mostrarBuscador ? (
                    <button type="button" className="btn-agregar-item" onClick={() => setMostrarBuscador(true)}>
                      + Añadir ítem
                    </button>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="campo-input admin-input-buscador"
                        placeholder="Buscar por modelo o SKU..."
                        value={terminoBusqueda}
                        onChange={(e) => buscarComponentes(e.target.value)}
                        autoFocus
                      />
                      
                      {resultadosBusqueda.length > 0 && (
                        <ul className="admin-dropdown-resultados">
                          {resultadosBusqueda.map(comp => (
                            <li key={comp.id} onClick={() => agregarNuevoItem(comp)}>
                              <span className="dropdown-modelo">{comp.modelo}</span>
                              <span className="dropdown-sku">SKU: {comp.sku}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button 
                        type="button" 
                        className="btn-cerrar-buscador"
                        onClick={() => {
                          setMostrarBuscador(false);
                          setTerminoBusqueda("");
                          setResultadosBusqueda([]);
                        }}
                      >
                        Cerrar buscador
                      </button>
                    </div>
                  )}
                </div>
              )}

            {Object.entries(agruparPorLab(isEditing ? editedItems : prestamo.items)).map(([lab, items]) => {
                const hayPendientesDeRetiro = items.some(i => i.estado !== 'retirado' && i.estado !== 'devuelto');

                return (
                  <div key={lab} className="admin-lab-grupo">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 className="admin-lab-titulo" style={{ margin: 0 }}>{lab}</h4>
                      
                      {!isEditing && (prestamo.estado === 'Aprobada' || prestamo.estado === 'Atrasado') && hayPendientesDeRetiro && (
                        <button 
                          className="btn-guardar" 
                          style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          onClick={async () => {
                            const itemsAActualizar = items.filter(i => i.estado !== 'retirado' && i.estado !== 'devuelto');
                            
                            await Promise.all(
                              itemsAActualizar.map(i => actualizarEstadoDetalle(i.detalleId!, 'retirado'))
                            );
                            
                            onRecargar();
                          }}
                        >
                          Retirado
                        </button>
                      )}
                    </div>

                    <ul className="admin-lista-items-v2">
                      {items.map((item) => {
                        //Calculamos lo que ya entregaron y lo que falta
                        const devueltos = item.cantidad_devuelta || 0; 
                        const pendientes = item.cantidad - devueltos;

                        return (
                          <li key={`${item.sku}-${lab}`}>
                            {isEditing ? (
                              <div className="admin-item-editable">
                              <button 
                                type="button" 
                                className="btn-eliminar-item"
                                title="Quitar ítem del préstamo"
                                onClick={() => handleEliminarItem(item.sku)}
                              >
                                {/* Icono de basurero en SVG - Mucho más elegante que una X */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </button>
                              <span>{item.modelo}:</span>
                              <input 
                                type="number" min="0" value={item.cantidad} 
                                onChange={(e) => handleCambiarCantidad(item.sku, parseInt(e.target.value) || 0)}
                                className="admin-input-cant-v2"
                              />
                            </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '8px' }}>
                                <div>
                                  <strong>{item.modelo}</strong> (Petición original: x{item.cantidad})
                                  {item.estado === 'retirado' && <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold' }}>[Retirado]</span>}
                                  {item.estado === 'devuelto' && <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>[Devuelto]</span>}
                                  
                                  {/* 2. LA ETIQUETA VISUAL: Avisa si hay una devolución a medias */}
                                  {devueltos > 0 && item.estado !== 'devuelto' && (
                                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#424242', fontWeight: 'bold' }}>
                                      [{devueltos} devueltos, faltan {pendientes}]
                                    </span>
                                  )}
                                </div>
                                
                                {(prestamo.estado === 'Aprobada' || prestamo.estado === 'Atrasado') && (
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    
                                    {item.estado === 'retirado' && itemADevolver !== item.detalleId && (
                                      <button 
                                        className="btn-cancelar"
                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                        onClick={() => {
                                            setItemADevolver(item.detalleId!);
                                            // 3. TOPE INICIAL: Sugiere solo los que faltan
                                            setCantidadParcial(pendientes); 
                                        }}
                                      >
                                        Devolver...
                                      </button>
                                    )}

                                    {/* CAJITA DE DEVOLUCIÓN PARCIAL */}
                                    {itemADevolver === item.detalleId && (
                                      <div className="devolucion-parcial-box">
                                        
                                        <button 
                                          className="btn-cerrar-flotante" 
                                          onClick={() => setItemADevolver(null)}
                                          title="Cancelar"
                                        >
                                          ✖
                                        </button>
                                        
                                        <label>¿Cuántos regresan?</label>
                                        <input 
                                          type="number" 
                                          className="input-cantidad-parcial"
                                          min="1" 
                                          max={pendientes} 
                                          value={cantidadParcial}
                                          onChange={(e) => setCantidadParcial(Math.min(pendientes, Math.max(1, parseInt(e.target.value) || 1)))}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: '#166534' }}>de {pendientes} faltantes</span>
                                        <button 
                                          type="button" 
                                          className="btn-mini-accion guardar" 
                                          title="Guardar" 
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            try {
                                              await procesarDevolucionParcial(prestamo.id, item.detalleId!, cantidadParcial);
                                              setItemADevolver(null);
                                              onRecargar();
                                            } catch (error) {
                                              console.error(error);
                                            }
                                        }}>✔️</button>
                                        
                                      </div>
                                    )}
                                        
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* MODAL DE APROBACIÓN */}
        {isApproving && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-contenido aprobacion">
              <h3 className="admin-modal-titulo" style={{ color: '#10b981' }}>Confirmar Aprobación</h3>
              <label className="label-aprobacion">Asignar fecha límite de devolución:</label>
              <input type="date" value={fechaAprobacion} onChange={(e) => setFechaAprobacion(e.target.value)} className="campo-input" />
              <div className="admin-botones-accion">
                <button type="button" className="btn-guardar" onClick={handleAprobarPrestamo}>Aprobar Solicitud</button>
                <button type="button" className="btn-cancelar" onClick={() => setIsApproving(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

  {/* MODAL DE CONTRAOFERTA (Aparece tras ajustar cantidades) */}
        {showContraofertaModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-contenido edicion">
              <h3 className="admin-modal-titulo">Confirmar Propuesta</h3>
              <p className="admin-modal-subtitulo">
                ¿Desea realizar este cambio? Revise las cantidades modificadas antes de enviar el motivo de rechazo:
              </p>

              {/* CAJA DE COMPARACIÓN ORIGINAL VS NUEVO */}
              <div className="admin-comparacion-box">
                {editedItems.map((newItem, idx) => {
                  // Buscamos si este ítem existía en la solicitud original
                  const originalItem = prestamo.items.find(i => i.sku === newItem.sku);
                  const isNew = !originalItem; // Si no existe, es un "pasajero sin boleto"
                  const isChanged = originalItem && originalItem.cantidad !== newItem.cantidad;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`admin-comparacion-item ${isChanged ? 'cambiado' : ''}`}
                      style={isNew ? { backgroundColor: '#ecfdf5', border: '1px solid #34d399' } : {}}
                    >
                      <span className="comparacion-modelo">
                        {newItem.modelo}
                        {/* Etiqueta bonita para los ítems nuevos */}
                        {isNew && <span style={{fontSize:'0.7rem', background:'#10b981', color:'white', padding:'2px 6px', borderRadius:'10px', marginLeft:'8px', fontWeight: 'bold'}}>NUEVO</span>}
                      </span>
                      <span className="comparacion-cantidades">
                        {isNew ? (
                          <strong className="texto-nuevo-valor" style={{color: '#059669'}}>+ {newItem.cantidad}</strong>
                        ) : (
                          <>
                            <span className={isChanged ? "texto-tachado" : ""}>
                              {originalItem.cantidad}
                            </span>
                            {isChanged && <strong className="texto-nuevo-valor">➔ {newItem.cantidad}</strong>}
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              <label className="label-edicion">Asignar nueva fecha límite de devolución:</label>
              <input 
                type="date" 
                value={fechaContraoferta} 
                onChange={(e) => setFechaContraoferta(e.target.value)} 
                className="campo-input" 
              />
              
              <div className="admin-botones-accion">
                <button type="button" className="btn-modificar-accion" onClick={handleEnviarContraoferta}>
                  Enviar Propuesta
                </button>
                <button type="button" className="btn-cancelar" onClick={() => setShowContraofertaModal(false)}>
                  Volver a edición
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE RECHAZO */}
        {isRejecting && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-contenido rechazo">
              <h3 className="admin-modal-titulo" style={{ color: '#ef4444' }}>Rechazar Solicitud</h3>
              <label className="label-rechazo">Razón de la denegación (Obligatorio):</label>
              <textarea 
                className="campo-input admin-textarea-rechazo" rows={3} 
                placeholder="Indique el motivo de rechazo..." 
                value={motivoRechazoInput} onChange={(e) => setMotivoRechazoInput(e.target.value)} 
              />
              <div className="admin-botones-accion">
                <button type="button" className="btn-rechazar-accion" disabled={motivoRechazoInput.trim() === ""} onClick={handleConfirmarRechazo}>Confirmar Rechazo</button>
                <button type="button" className="btn-cancelar" onClick={() => { setIsRejecting(false); setMotivoRechazoInput(""); }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }