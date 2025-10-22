-- Añadir campos adicionales a restaurants para información del chatbot
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS faq_info TEXT,
ADD COLUMN IF NOT EXISTS additional_info TEXT,
ADD COLUMN IF NOT EXISTS menu_description TEXT;

-- Crear tabla para items del menú/carta
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Políticas para menu_items
CREATE POLICY "Todos pueden ver items del menú de restaurantes activos"
ON public.menu_items
FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants 
    WHERE restaurants.id = menu_items.restaurant_id 
    AND restaurants.is_active = true
  )
);

CREATE POLICY "Los dueños pueden gestionar items del menú"
ON public.menu_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants 
    WHERE restaurants.id = menu_items.restaurant_id 
    AND restaurants.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants 
    WHERE restaurants.id = menu_items.restaurant_id 
    AND restaurants.owner_id = auth.uid()
  )
);

-- Trigger para updated_at en menu_items
CREATE TRIGGER handle_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Crear función para verificar disponibilidad de mesas
CREATE OR REPLACE FUNCTION public.check_table_availability(
  p_restaurant_id UUID,
  p_date DATE,
  p_time TIME,
  p_guests INTEGER
)
RETURNS TABLE(
  table_id UUID,
  table_number TEXT,
  capacity INTEGER
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.table_number,
    t.capacity
  FROM public.tables t
  WHERE t.restaurant_id = p_restaurant_id
    AND t.is_available = true
    AND t.capacity >= p_guests
    AND NOT EXISTS (
      SELECT 1 
      FROM public.reservations r
      WHERE r.table_id = t.id
        AND r.reservation_date = p_date
        AND r.reservation_time = p_time
        AND r.status IN ('pending', 'confirmed')
    )
  ORDER BY t.capacity ASC
  LIMIT 1;
END;
$$;