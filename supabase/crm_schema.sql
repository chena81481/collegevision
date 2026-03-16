-- ============================================================
-- CRM Tables (Scalable Relational Schema)
-- ============================================================

-- 1. COMPANIES (Accounts)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. CONTACTS (The People)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    job_title VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. DEALS (Opportunities)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2),
    stage VARCHAR(50) DEFAULT 'Lead', -- e.g., 'Lead', 'Contacted', 'Proposal', 'Won', 'Lost'
    expected_close_date DATE,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. ACTIVITIES (The Log)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'Call', 'Email', 'Meeting', 'Note'
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- Row-Level Security (RLS)
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Simple RBAC: Users can only see deals assigned to them (or all if they are admins)
-- Note: Assuming there's a way to identify admins, otherwise just 'assigned_to' check.
CREATE POLICY "Users can view assigned deals" ON deals
    FOR SELECT USING (auth.uid() = assigned_to);

CREATE POLICY "Users can update assigned deals" ON deals
    FOR UPDATE USING (auth.uid() = assigned_to);

-- For simplicity in this initial setup, we'll allow all authenticated users to read companies/contacts
-- but you might want to restrict this further.
CREATE POLICY "Authenticated users can read companies" ON companies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read contacts" ON contacts
    FOR SELECT TO authenticated USING (true);
