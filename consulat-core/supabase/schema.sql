-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'AGENT', 'CITIZEN', 'FOREIGNER');
CREATE TYPE organization_type AS ENUM ('EMBASSY', 'CONSULATE', 'GENERAL_CONSULATE', 'HONORARY_CONSULATE', 'OTHER');
CREATE TYPE organization_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE request_status AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'ACTION_REQUIRED', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo TEXT,
    type organization_type NOT NULL,
    status organization_status DEFAULT 'ACTIVE',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consular Services
CREATE TABLE consular_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id),
    is_active BOOLEAN DEFAULT true,
    requirements JSONB, -- List of required documents/info
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles (Citizens)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE,
    birth_place TEXT,
    nationality TEXT,
    passport_number TEXT,
    phone TEXT,
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests (Démarches)
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES consular_services(id),
    user_id UUID REFERENCES auth.users(id),
    profile_id UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id),
    status request_status DEFAULT 'DRAFT',
    data JSONB, -- Form data
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT,
    url TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    request_id UUID REFERENCES service_requests(id),
    status TEXT DEFAULT 'PENDING', -- PENDING, VALIDATED, REJECTED
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    service_id UUID REFERENCES consular_services(id),
    user_id UUID REFERENCES auth.users(id),
    request_id UUID REFERENCES service_requests(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
