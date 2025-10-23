-- Agregar columnas para personalización del restaurante
ALTER TABLE public.restaurants 
ADD COLUMN logo_url text,
ADD COLUMN theme_colors jsonb DEFAULT '{"primary": "#8B5CF6", "secondary": "#EC4899"}'::jsonb,
ADD COLUMN max_capacity integer,
ADD COLUMN gallery_photos text[] DEFAULT ARRAY[]::text[];

-- Crear tabla de reseñas
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  photos text[] DEFAULT ARRAY[]::text[],
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan ver reseñas de restaurantes activos
CREATE POLICY "Todos pueden ver reseñas de restaurantes activos"
ON public.reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = reviews.restaurant_id
    AND restaurants.is_active = true
  )
);

-- Política para que clientes con reservas confirmadas puedan crear reseñas
CREATE POLICY "Clientes con reservas pueden crear reseñas"
ON public.reviews FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reservations
    WHERE reservations.id = reviews.reservation_id
    AND reservations.customer_email = reviews.customer_email
    AND reservations.status = 'confirmed'
  )
  OR auth.uid() IS NOT NULL
);

-- Política para que dueños puedan ver todas las reseñas de sus restaurantes
CREATE POLICY "Dueños pueden gestionar reseñas de sus restaurantes"
ON public.reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = reviews.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);

-- Trigger para actualizar updated_at en reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Función para verificar aforo total del restaurante
CREATE OR REPLACE FUNCTION public.check_restaurant_capacity(
  p_restaurant_id uuid,
  p_date date,
  p_time time without time zone,
  p_guests integer
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_capacity integer;
  v_current_guests integer;
BEGIN
  -- Obtener capacidad máxima del restaurante
  SELECT max_capacity INTO v_max_capacity
  FROM public.restaurants
  WHERE id = p_restaurant_id;
  
  -- Si no hay límite de capacidad, permitir la reserva
  IF v_max_capacity IS NULL THEN
    RETURN true;
  END IF;
  
  -- Calcular total de invitados en ese horario
  SELECT COALESCE(SUM(number_of_guests), 0) INTO v_current_guests
  FROM public.reservations
  WHERE restaurant_id = p_restaurant_id
    AND reservation_date = p_date
    AND reservation_time = p_time
    AND status IN ('pending', 'confirmed');
  
  -- Verificar si hay espacio para los nuevos invitados
  RETURN (v_current_guests + p_guests) <= v_max_capacity;
END;
$$;