-- Migration to add extra event details columns to 'events' table
-- This allows more personalization for birthdays, corporate events, and general parties.

DO $$ 
BEGIN
    -- Add birthday_person_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'birthday_person_name') THEN
        ALTER TABLE public.events ADD COLUMN birthday_person_name TEXT;
        COMMENT ON COLUMN public.events.birthday_person_name IS 'Name of the birthday person for birthday events';
    END IF;

    -- Add birthday_age
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'birthday_age') THEN
        ALTER TABLE public.events ADD COLUMN birthday_age INTEGER;
        COMMENT ON COLUMN public.events.birthday_age IS 'Age being celebrated for birthday events';
    END IF;

    -- Add company_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'company_name') THEN
        ALTER TABLE public.events ADD COLUMN company_name TEXT;
        COMMENT ON COLUMN public.events.company_name IS 'Name of the company for corporate events';
    END IF;

    -- Add department
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'department') THEN
        ALTER TABLE public.events ADD COLUMN department TEXT;
        COMMENT ON COLUMN public.events.department IS 'Department name for corporate events';
    END IF;

    -- Add host_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'host_name') THEN
        ALTER TABLE public.events ADD COLUMN host_name TEXT;
        COMMENT ON COLUMN public.events.host_name IS 'Name of the event host';
    END IF;

    -- Add party_reason
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'party_reason') THEN
        ALTER TABLE public.events ADD COLUMN party_reason TEXT;
        COMMENT ON COLUMN public.events.party_reason IS 'General reason for the party or celebration';
    END IF;
END $$;
