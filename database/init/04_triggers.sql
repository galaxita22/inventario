-- Trigger para actualizar el estado del componente
CREATE TRIGGER trigger_actualizar_estado
BEFORE INSERT OR UPDATE
ON componentes
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_componente();

--Trigger para cambiar todos los estados de los detalles de un prestamo
CREATE TRIGGER trigger_actualizar_estado_detalle_prestamo
AFTER UPDATE
ON prestamos
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_detalle_prestamo();
