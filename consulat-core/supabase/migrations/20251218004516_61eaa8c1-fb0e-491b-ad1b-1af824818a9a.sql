-- ============================================================================
-- MIGRATION: Add child_profiles and notifications tables
-- Part of Consulat.ga-core migration from Next.js/Convex
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Profile status enum
DO $$ BEGIN
    CREATE TYPE profile_status AS ENUM ('draft', 'active', 'inactive', 'pending', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Gender enum
DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('male', 'female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification status enum
DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification type enum
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

-- Notification channel enum
DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('app', 'email', 'sms');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CHILD PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.child_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status profile_status DEFAULT 'draft',
    
    -- Personal information (stored as JSONB for flexibility)
    personal JSONB NOT NULL DEFAULT '{}',
    
    -- Family information
    family JSONB DEFAULT '{}',
    
    -- Documents references
    documents JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for child_profiles
CREATE POLICY "Users can view their own children profiles"
ON public.child_profiles
FOR SELECT
USING (
    parent_profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create child profiles for themselves"
ON public.child_profiles
FOR INSERT
WITH CHECK (
    parent_profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own children profiles"
ON public.child_profiles
FOR UPDATE
USING (
    parent_profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own children profiles"
ON public.child_profiles
FOR DELETE
USING (
    parent_profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all child profiles"
ON public.child_profiles
FOR ALL
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'agent') OR 
    has_role(auth.uid(), 'super_admin')
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification details
    type notification_type NOT NULL,
    channel notification_channel DEFAULT 'app',
    status notification_status DEFAULT 'pending',
    
    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Optional references
    request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'super_admin')
);

-- ============================================================================
-- ADD ENHANCED COLUMNS TO PROFILES TABLE
-- ============================================================================

-- Add status column if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status profile_status DEFAULT 'draft';

-- Add residence_country column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS residence_country TEXT;

-- Add JSONB columns for structured data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS personal JSONB DEFAULT '{}';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS family JSONB DEFAULT '{}';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS contacts JSONB DEFAULT '{}';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profession_situation JSONB DEFAULT '{}';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS consular_card JSONB DEFAULT '{}';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_child_profiles_parent ON public.child_profiles(parent_profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_residence_country ON public.profiles(residence_country);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE TRIGGER update_child_profiles_updated_at
    BEFORE UPDATE ON public.child_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();