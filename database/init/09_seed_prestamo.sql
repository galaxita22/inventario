INSERT INTO prestamos (id_usuario, fecha_peticion, codigo_peticion, fecha_retiro, fecha_estimada_devolucion, fecha_devolucion, estado, motivo_rechazo) VALUES
    (1, '2024-07-01', 'PET001', '2024-07-01', '2024-07-10', NULL, 'pendiente', NULL),
    (2, '2024-07-05', 'PET002', '2024-07-05', '2024-07-15', NULL, 'aprobado', NULL),
    (1, '2024-07-10', 'PET003', '2024-07-10', '2024-07-20', NULL, 'rechazado', 'No cumple con los requisitos'),
    (2, '2025-07-12', 'PET004', '2024-07-12', '2025-07-22', NULL, 'devuelto', NULL)
ON CONFLICT (codigo_peticion) DO NOTHING;
