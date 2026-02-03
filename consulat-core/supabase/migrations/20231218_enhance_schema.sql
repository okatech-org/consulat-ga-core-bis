-- ============================================================================
-- Migration: Enhance Profiles Table
-- Adds comprehensive fields for citizen profiles from consulat migration
-- ============================================================================

-- Create profile_status enum if not exists
DO $$ BEGIN
    CREATE TYPE profile_status AS ENUM ('draft', 'pending', 'active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create gender enum if not exists
DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('male', 'female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create marital_status enum if not exists
DO $$ BEGIN
    CREATE TYPE marital_status AS ENUM ('single', 'married', 'divorced', 'widowed', 'civil_union', 'cohabiting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create work_status enum if not exists
DO $$ BEGIN
    CREATE TYPE work_status AS ENUM ('self_employed', 'employee', 'entrepreneur', 'unemployed', 'retired', 'student', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status profile_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS residence_country TEXT,
ADD COLUMN IF NOT EXISTS personal JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS family JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS consular_card JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profession_situation JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS registration_request_id UUID;

-- Add foreign key for registration request
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_registration_request_id_fkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_registration_request_id_fkey 
FOREIGN KEY (registration_request_id) REFERENCES service_requests(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_residence_country ON profiles(residence_country);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================================================
-- Migration: Enhance Consular Services Table
-- ============================================================================

-- Create service_category enum if not exists
DO $$ BEGIN
    CREATE TYPE service_category AS ENUM (
        'identity', 'civil_status', 'visa', 'certification', 
        'transcript', 'registration', 'assistance', 'travel_document', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create service_status enum if not exists
DO $$ BEGIN
    CREATE TYPE service_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to consular_services table
ALTER TABLE consular_services
ADD COLUMN IF NOT EXISTS code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS category service_category DEFAULT 'other',
ADD COLUMN IF NOT EXISTS status service_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS countries TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS processing JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS delivery JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{"isFree": false}',
ADD COLUMN IF NOT EXISTS automation_workflow_id UUID;

-- Create indexes for services
CREATE INDEX IF NOT EXISTS idx_services_code ON consular_services(code);
CREATE INDEX IF NOT EXISTS idx_services_category ON consular_services(category);
CREATE INDEX IF NOT EXISTS idx_services_status ON consular_services(status);
CREATE INDEX IF NOT EXISTS idx_services_organization ON consular_services(organization_id);

-- ============================================================================
-- Migration: Enhance Service Requests Table
-- ============================================================================

-- Create enhanced request_status enum if not already comprehensive
DO $$ BEGIN
    DROP TYPE IF EXISTS request_status CASCADE;
    CREATE TYPE request_status AS ENUM (
        'draft', 'pending', 'pending_completion', 'edited', 'submitted',
        'under_review', 'in_production', 'validated', 'rejected',
        'ready_for_pickup', 'appointment_scheduled', 'completed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create request_priority enum if not exists
DO $$ BEGIN
    CREATE TYPE request_priority AS ENUM ('normal', 'urgent', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to service_requests table
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS priority request_priority DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS requester_id UUID,
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID,
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS document_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS delivery JSONB,
ADD COLUMN IF NOT EXISTS generated_documents UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Add foreign keys
ALTER TABLE service_requests
DROP CONSTRAINT IF EXISTS service_requests_requester_id_fkey;

ALTER TABLE service_requests
ADD CONSTRAINT service_requests_requester_id_fkey 
FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for requests
CREATE INDEX IF NOT EXISTS idx_requests_number ON service_requests(number);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON service_requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_profile ON service_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON service_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_agent ON service_requests(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_requests_organization ON service_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_requests_submitted_at ON service_requests(submitted_at);

-- ============================================================================
-- Migration: Enhance Appointments Table
-- ============================================================================

-- Create appointment_type enum if not exists
DO $$ BEGIN
    CREATE TYPE appointment_type AS ENUM (
        'document_submission', 'document_collection', 'interview',
        'marriage_ceremony', 'emergency', 'consultation', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enhanced appointment_status enum
DO $$ BEGIN
    DROP TYPE IF EXISTS appointment_status_new CASCADE;
    CREATE TYPE appointment_status_new AS ENUM (
        'draft', 'pending', 'scheduled', 'confirmed', 
        'completed', 'cancelled', 'missed', 'rescheduled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS type appointment_type DEFAULT 'other',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris',
ADD COLUMN IF NOT EXISTS profile_id UUID,
ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS actions JSONB DEFAULT '[]';

-- Add foreign key for profile
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_profile_id_fkey;

ALTER TABLE appointments
ADD CONSTRAINT appointments_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_profile ON appointments(profile_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization ON appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);

-- ============================================================================
-- Migration: Create Child Profiles Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS child_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status profile_status DEFAULT 'draft',
    personal JSONB NOT NULL DEFAULT '{}',
    family JSONB DEFAULT '{}',
    documents JSONB DEFAULT '{}',
    registration_request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for child_profiles
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent ON child_profiles(parent_profile_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_status ON child_profiles(status);

-- ============================================================================
-- Migration: Create Notifications Table
-- ============================================================================

-- Create notification_status enum if not exists
DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notification_type enum if not exists
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'updated', 'reminder', 'confirmation', 'cancellation', 'communication',
        'important_communication', 'appointment_confirmation', 'appointment_reminder',
        'appointment_cancellation', 'consular_registration_submitted',
        'consular_registration_validated', 'consular_registration_rejected',
        'consular_card_ready', 'consular_registration_completed', 'feedback'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notification_channel enum if not exists
DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('app', 'email', 'sms');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    channel notification_channel DEFAULT 'app',
    status notification_status DEFAULT 'pending',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- Function: Generate unique request number
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    seq_num INTEGER;
    result TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(number FROM '\d+$') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM service_requests
    WHERE number LIKE 'REQ-' || year_part || '-%';
    
    result := 'REQ-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Trigger: Auto-generate request number on insert
-- ============================================================================

CREATE OR REPLACE FUNCTION set_request_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.number IS NULL THEN
        NEW.number := generate_request_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_request_number ON service_requests;
CREATE TRIGGER trigger_set_request_number
    BEFORE INSERT ON service_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_request_number();

-- ============================================================================
-- Trigger: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_child_profiles_updated_at ON child_profiles;
CREATE TRIGGER trigger_child_profiles_updated_at
    BEFORE UPDATE ON child_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_service_requests_updated_at ON service_requests;
CREATE TRIGGER trigger_service_requests_updated_at
    BEFORE UPDATE ON service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
