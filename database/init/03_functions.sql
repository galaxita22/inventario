-- Funciones para actualizar el estado de los componentes cuando el stock es critico o nulo
CREATE OR REPLACE FUNCTION actualizar_estado_componente()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.cantidad <= 0 THEN
        NEW.estado := 'agotado';

    ELSIF NEW.cantidad <= NEW.stock_critico THEN
        NEW.estado := 'critico';

    ELSE
        NEW.estado := 'disponible';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_estado_detalle_prestamo()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.estado = 'aprobado' THEN
        UPDATE detalle_prestamo
        SET estado = 'aprobado'
        WHERE id_prestamo = NEW.id;
    ELSIF NEW.estado = 'rechazado' THEN
        UPDATE detalle_prestamo
        SET estado = 'rechazado'
        WHERE id_prestamo = NEW.id;
    ELSIF NEW.estado = 'devuelto' THEN
        UPDATE detalle_prestamo
        SET estado = 'devuelto'
        WHERE id_prestamo = NEW.id;
    ELSIF NEW.estado = 'pendiente' THEN
        UPDATE detalle_prestamo
        SET estado = 'pendiente'
        WHERE id_prestamo = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
