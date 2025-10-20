-- Crear enum para roles de usuario
CREATE TYPE public.app_role AS ENUM ('admin', 'restaurant_owner', 'customer');

-- Crear enum para estado de reservas
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Función para verificar roles (security definer para evitar recursión en RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Tabla de restaurantes
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  cuisine_type TEXT,
  price_range TEXT,
  opening_hours JSONB,
  image_url TEXT,
  booking_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mesas
CREATE TABLE public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  table_number TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

-- Tabla de reservas
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
  status reservation_status DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para user_roles
CREATE POLICY "Los usuarios pueden ver sus propios roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Solo admins pueden gestionar roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para restaurants
CREATE POLICY "Todos pueden ver restaurantes activos"
  ON public.restaurants FOR SELECT
  USING (is_active = true OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Los dueños pueden crear restaurantes"
  ON public.restaurants FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'restaurant_owner'));

CREATE POLICY "Los dueños pueden actualizar sus restaurantes"
  ON public.restaurants FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Los dueños pueden eliminar sus restaurantes"
  ON public.restaurants FOR DELETE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para tables
CREATE POLICY "Todos pueden ver mesas de restaurantes activos"
  ON public.tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE id = restaurant_id AND (is_active = true OR owner_id = auth.uid())
    )
  );

CREATE POLICY "Los dueños pueden gestionar mesas de sus restaurantes"
  ON public.tables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE id = restaurant_id AND owner_id = auth.uid()
    )
  );

-- Políticas RLS para reservations
CREATE POLICY "Los clientes pueden ver sus propias reservas"
  ON public.reservations FOR SELECT
  USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE id = restaurant_id AND owner_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Los clientes autenticados pueden crear reservas"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Los clientes pueden actualizar sus propias reservas"
  ON public.reservations FOR UPDATE
  USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE id = restaurant_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Los clientes pueden cancelar sus propias reservas"
  ON public.reservations FOR DELETE
  USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE id = restaurant_id AND owner_id = auth.uid()
    )
  );

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Asignar rol de customer por defecto
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_restaurants
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_reservations
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();