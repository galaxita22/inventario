INSERT INTO detalle_prestamo (id_prestamo, id_componente, cantidad) VALUES
    (7, 1, 2),
    (7, 2, 1),
    (8, 3, 5)
ON CONFLICT (id_prestamo, id_componente) DO NOTHING;