INSERT INTO labs (nombre, edificio) VALUES
    ('Laboratorio de electrónica', 'Edificio A'),
    ('Laboratorio de automatización', 'Edificio B'),
    ('Laboratorio de robótica y fabricación digital','Edificio D'),
    ('Sala de memoristas', 'Edificio C')
ON CONFLICT (nombre) DO NOTHING;    