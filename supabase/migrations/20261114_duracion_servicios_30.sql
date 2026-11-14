-- Fuerza 30 minutos para las nuevas reservas de los tres servicios.
-- No modifica los turnos existentes.

CREATE OR REPLACE FUNCTION public.forzar_duracion_servicios_30()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.servicio IN ('Corte de pelo', 'Corte + Barba', 'Color / Claritos') THEN
        NEW.duracion := 30;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_forzar_duracion_corte_barba_40
ON public.turnos;
DROP TRIGGER IF EXISTS trg_forzar_duracion_servicios_30
ON public.turnos;

CREATE TRIGGER trg_forzar_duracion_servicios_30
BEFORE INSERT ON public.turnos
FOR EACH ROW
EXECUTE FUNCTION public.forzar_duracion_servicios_30();

