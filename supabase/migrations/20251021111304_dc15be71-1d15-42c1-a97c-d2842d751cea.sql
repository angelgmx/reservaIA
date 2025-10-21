-- Eliminar la política restrictiva de INSERT en reservations
DROP POLICY IF EXISTS "Los clientes autenticados pueden crear reservas" ON public.reservations;

-- Crear nueva política que permite a cualquiera crear reservas (para formulario público)
CREATE POLICY "Cualquiera puede crear reservas"
ON public.reservations
FOR INSERT
WITH CHECK (true);

-- Actualizar política SELECT para permitir ver reservas del restaurante
DROP POLICY IF EXISTS "Los clientes pueden ver sus propias reservas" ON public.reservations;

CREATE POLICY "Los clientes y dueños pueden ver reservas"
ON public.reservations
FOR SELECT
USING (
  auth.uid() = customer_id 
  OR EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = reservations.restaurant_id 
    AND restaurants.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);