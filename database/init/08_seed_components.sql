INSERT INTO componentes (sku, lab_id, familia, modelo, tipo, cantidad, codigo_utalca, numero_serial, imagen_ref, descripcion) VALUES
    ('SKU001', 1, 'Familia1', 'Modelo1', 'Tipo1', 10, 'CU001', 'NS001', '/uploads/arduino.webp', 'Descripción del componente 1'),
    ('SKU002', 2, 'Familia2', 'Modelo2', 'Tipo2', 5, 'CU002', 'NS002', '/uploads/cautin.png', 'Descripción del componente 2'),
    ('SKU003', 3, 'Familia3', 'Modelo3', 'Tipo3', 20, 'CU003', 'NS003', '/uploads/multimetro.jpg', 'Descripción del componente 3')
ON CONFLICT (sku) DO NOTHING;
