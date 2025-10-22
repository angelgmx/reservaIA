-- Eliminar la política restrictiva existente para INSERT en user_roles
DROP POLICY IF EXISTS "Solo admins pueden gestionar roles" ON public.user_roles;

-- Crear políticas más granulares
-- Los admins pueden hacer todo
CREATE POLICY "Admins pueden gestionar todos los roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Los usuarios pueden asignarse el rol de restaurant_owner a sí mismos
CREATE POLICY "Los usuarios pueden asignarse el rol de restaurant_owner"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'restaurant_owner'
);

-- Los usuarios pueden actualizar/eliminar solo sus propios roles no-admin
CREATE POLICY "Los usuarios pueden gestionar sus propios roles no-admin"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND role != 'admin'
);

CREATE POLICY "Los usuarios pueden eliminar sus propios roles no-admin"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND role != 'admin'
);