-- Create enum types
CREATE TYPE public.organization_type AS ENUM (
  'CONSULAT_GENERAL',
  'CONSULAT',
  'AMBASSADE',
  'HAUT_COMMISSARIAT',
  'MISSION_PERMANENTE'
);

CREATE TYPE public.request_type AS ENUM (
  'PASSPORT',
  'VISA',
  'CIVIL_REGISTRY',
  'LEGALIZATION',
  'CONSULAR_CARD',
  'ATTESTATION'
);

CREATE TYPE public.request_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'AWAITING_DOCUMENTS',
  'VALIDATED',
  'REJECTED',
  'COMPLETED'
);

CREATE TYPE public.request_priority AS ENUM (
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
);

CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'admin',
  'agent',
  'citizen'
);

CREATE TYPE public.appointment_status AS ENUM (
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  date_of_birth DATE,
  consulate_file TEXT,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type organization_type NOT NULL,
  jurisdiction TEXT[] NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  city TEXT,
  country TEXT,
  country_code TEXT,
  enabled_services TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT,
  price DECIMAL(10,2),
  processing_time_days INTEGER,
  required_documents TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type request_type NOT NULL,
  status request_status DEFAULT 'PENDING' NOT NULL,
  priority request_priority DEFAULT 'NORMAL' NOT NULL,
  citizen_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  citizen_name TEXT NOT NULL,
  citizen_email TEXT NOT NULL,
  citizen_phone TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  attached_documents TEXT[],
  required_documents TEXT[],
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name TEXT,
  internal_notes TEXT,
  expected_completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status appointment_status DEFAULT 'SCHEDULED' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
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

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and agents can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'agent') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for organizations
CREATE POLICY "Everyone can view organizations"
  ON public.organizations FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage organizations"
  ON public.organizations FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for services
CREATE POLICY "Everyone can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for requests
CREATE POLICY "Citizens can view their own requests"
  ON public.requests FOR SELECT
  USING (auth.uid() = citizen_id);

CREATE POLICY "Citizens can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Agents and admins can view all requests"
  ON public.requests FOR SELECT
  USING (
    public.has_role(auth.uid(), 'agent') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Agents and admins can update requests"
  ON public.requests FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'agent') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for appointments
CREATE POLICY "Citizens can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = citizen_id);

CREATE POLICY "Agents can view their assigned appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents and admins can view all appointments"
  ON public.appointments FOR SELECT
  USING (
    public.has_role(auth.uid(), 'agent') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Agents and admins can manage appointments"
  ON public.appointments FOR ALL
  USING (
    public.has_role(auth.uid(), 'agent') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_requests
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_appointments
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_requests_citizen_id ON public.requests(citizen_id);
CREATE INDEX idx_requests_assigned_to ON public.requests(assigned_to);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_appointments_citizen_id ON public.appointments(citizen_id);
CREATE INDEX idx_appointments_agent_id ON public.appointments(agent_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);