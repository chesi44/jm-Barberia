-- Mensualidad de 4 cortes: la reserva de compra cuesta $50.000 y cuenta como el primero.
-- Los tres siguientes turnos de Corte de pelo descuentan un corte y se guardan a $0.
-- No modifica los turnos existentes.

CREATE TABLE IF NOT EXISTS public.mensualidades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    telefono text,
    turno_compra_id text,
    fecha_compra date NOT NULL,
    vence_el date NOT NULL,
    cortes_incluidos integer NOT NULL DEFAULT 4,
    cortes_usados integer NOT NULL DEFAULT 1,
    creada_en timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT mensualidades_cortes_validos CHECK (
        cortes_incluidos > 0 AND cortes_usados >= 0 AND cortes_usados <= cortes_incluidos
    )
);

ALTER TABLE public.turnos
    ADD COLUMN IF NOT EXISTS mensualidad_id uuid;

CREATE INDEX IF NOT EXISTS mensualidades_busqueda_cliente_idx
    ON public.mensualidades (lower(btrim(nombre)), vence_el);

CREATE UNIQUE INDEX IF NOT EXISTS mensualidades_turno_compra_idx
    ON public.mensualidades (turno_compra_id)
    WHERE turno_compra_id IS NOT NULL;

-- Importa compras mensuales que ya existían antes de ejecutar este SQL.
INSERT INTO public.mensualidades (
    nombre,
    telefono,
    turno_compra_id,
    fecha_compra,
    vence_el,
    cortes_incluidos,
    cortes_usados
)
SELECT
    t.nombre,
    t.telefono,
    t.id::text,
    t.fecha,
    (t.fecha + interval '1 month')::date,
    4,
    1
FROM public.turnos AS t
WHERE t.promocion = 'mensual'
  AND t.estado IS DISTINCT FROM 'cancelado'
ON CONFLICT (turno_compra_id) WHERE turno_compra_id IS NOT NULL DO NOTHING;

UPDATE public.turnos AS t
   SET mensualidad_id = m.id
  FROM public.mensualidades AS m
 WHERE t.promocion = 'mensual'
   AND m.turno_compra_id = t.id::text
   AND t.mensualidad_id IS NULL;

ALTER TABLE public.mensualidades ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.mensualidades TO authenticated;

DROP POLICY IF EXISTS mensualidades_lectura_admin ON public.mensualidades;
CREATE POLICY mensualidades_lectura_admin
    ON public.mensualidades
    FOR SELECT
    TO authenticated
    USING (true);

CREATE OR REPLACE FUNCTION public.aplicar_corte_mensualidad()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_mensualidad_id uuid;
BEGIN
    -- La primera reserva es la compra del paquete y no se descuenta a $0.
    IF NEW.promocion = 'mensual' OR NEW.servicio <> 'Corte de pelo' THEN
        RETURN NEW;
    END IF;

    SELECT m.id
      INTO v_mensualidad_id
      FROM public.mensualidades AS m
     WHERE m.cortes_usados < m.cortes_incluidos
       AND m.vence_el >= NEW.fecha
       AND (
            lower(btrim(m.nombre)) = lower(btrim(NEW.nombre))
            OR (
                NULLIF(regexp_replace(COALESCE(NEW.telefono, ''), '\D', '', 'g'), '') IS NOT NULL
                AND regexp_replace(COALESCE(m.telefono, ''), '\D', '', 'g') =
                    regexp_replace(COALESCE(NEW.telefono, ''), '\D', '', 'g')
            )
       )
     ORDER BY m.creada_en DESC
     LIMIT 1
     FOR UPDATE;

    IF v_mensualidad_id IS NOT NULL THEN
        UPDATE public.mensualidades
           SET cortes_usados = cortes_usados + 1
         WHERE id = v_mensualidad_id;

        NEW.precio := 0;
        NEW.promocion := 'mensual_corte';
        NEW.mensualidad_id := v_mensualidad_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_aplicar_corte_mensualidad ON public.turnos;
CREATE TRIGGER trg_aplicar_corte_mensualidad
BEFORE INSERT ON public.turnos
FOR EACH ROW
EXECUTE FUNCTION public.aplicar_corte_mensualidad();

CREATE OR REPLACE FUNCTION public.registrar_compra_mensualidad()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_mensualidad_id uuid;
BEGIN
    IF NEW.promocion IS DISTINCT FROM 'mensual' THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.mensualidades (
        nombre,
        telefono,
        turno_compra_id,
        fecha_compra,
        vence_el,
        cortes_incluidos,
        cortes_usados
    )
    VALUES (
        NEW.nombre,
        NEW.telefono,
        NEW.id::text,
        NEW.fecha,
        (NEW.fecha + interval '1 month')::date,
        4,
        1
    )
    RETURNING id INTO v_mensualidad_id;

    UPDATE public.turnos
       SET mensualidad_id = v_mensualidad_id
     WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_registrar_compra_mensualidad ON public.turnos;
CREATE TRIGGER trg_registrar_compra_mensualidad
AFTER INSERT ON public.turnos
FOR EACH ROW
EXECUTE FUNCTION public.registrar_compra_mensualidad();

CREATE OR REPLACE FUNCTION public.reintegrar_corte_mensualidad_cancelado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado
       AND NEW.estado = 'cancelado'
       AND NEW.mensualidad_id IS NOT NULL THEN
        IF NEW.promocion = 'mensual' THEN
            -- Si se cancela la compra, se desactiva el paquete.
            UPDATE public.mensualidades
               SET cortes_usados = cortes_incluidos
             WHERE id = NEW.mensualidad_id;
        ELSE
            UPDATE public.mensualidades
               SET cortes_usados = GREATEST(1, cortes_usados - 1)
             WHERE id = NEW.mensualidad_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reintegrar_corte_mensualidad_cancelado ON public.turnos;
CREATE TRIGGER trg_reintegrar_corte_mensualidad_cancelado
AFTER UPDATE OF estado ON public.turnos
FOR EACH ROW
EXECUTE FUNCTION public.reintegrar_corte_mensualidad_cancelado();
