-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Student Consent Table (DPDP Act Complaint)
CREATE TABLE IF NOT EXISTS student_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR NOT NULL,
    phone_number_encrypted TEXT, -- Encrypted using pgcrypto
    consent_for_sms BOOLEAN DEFAULT FALSE,
    consent_for_calls BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consent_ip_address INET,
    
    -- Anti-Spam Governance
    calls_received_count INT DEFAULT 0,
    last_call_timestamp TIMESTAMP WITH TIME ZONE,
    opted_out BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT max_calls_per_week CHECK (calls_received_count <= 2)
);

-- 2. Encryption Triggers for Leads Table
-- Assumption: A vault/key for encryption exists or we use a fixed key for MVP (Not recommended for prod)
-- In a real Supabase environment, you would use vault.decrypted_secrets

CREATE OR REPLACE FUNCTION encrypt_pii_phone()
RETURNS TRIGGER AS $$
DECLARE
  encryption_key TEXT := 'collegevision_secure_key_32_chars'; -- In production, use vault
BEGIN
  IF NEW.phone IS NOT NULL THEN
    NEW.phone = pgp_sym_encrypt(NEW.phone, encryption_key)::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- If 'leads' table exists, bind the trigger
-- CREATE TRIGGER trigger_encrypt_phone
-- BEFORE INSERT OR UPDATE ON leads
-- FOR EACH ROW
-- EXECUTE FUNCTION encrypt_pii_phone();

-- 3. Audit Log for PII Access
CREATE TABLE IF NOT EXISTS pii_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accessed_by UUID REFERENCES auth.users(id),
    accessed_table VARCHAR,
    accessed_record_id UUID,
    access_reason VARCHAR,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reusable update trigger
CREATE TRIGGER update_student_consent_updated_at
    BEFORE UPDATE ON student_consent
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
