INSERT INTO accounts (nombre_usuario, email, contrasena, role, rut, matricula, escuela, avatar_ref) 
VALUES ('Admin Los Libertadores', 'admin@loslibertadores.cl', '$2y$10$123456789012345678901uiaLpJxTpf6VbfI5NADlsRsfvEm6aq9C', 'aprobador', '1.111.111-1', '000000001', 'Administración', NULL) 
ON CONFLICT (email) DO NOTHING;

INSERT INTO accounts (nombre_usuario, email, contrasena, role, rut, matricula, escuela, avatar_ref) 
VALUES ('Docente Prueba', 'docente@loslibertadores.cl', '$2b$10$iTvdZviQcukr3.Xoeppgzu6Gutpm27gswtvphnSfBiDAwOhsGjyhO', 'solicitante', '1.111.111-2', '000000002', 'Ciencias', NULL) 
ON CONFLICT (email) DO NOTHING;