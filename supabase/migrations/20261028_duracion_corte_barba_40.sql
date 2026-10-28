-- Fuerza 40 minutos para nuevas reservas de Corte + Barba.
-- No modifica los turnos que ya existen.

CREATE OR REPLACE FUNCTION public.forzar_duracion_corte_barba_40()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.servicio = 'Corte + Barba' THEN
        NEW.duracion := 40;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_forzar_duracion_corte_barba_40
ON public.turnos;

CREATE TRIGGER trg_forzar_duracion_corte_barba_40
BEFORE INSERT ON public.turnos
FOR EACH ROW
EXECUTE FUNCTION public.forzar_duracion_corte_barba_40();
