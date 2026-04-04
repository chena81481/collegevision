# Non-Negotiable Supabase Security (RLS)

## Rule
Whenever generating or modifying database schema related to user profiles, applications, or sensitive student data, you **MUST** simultaneously provide the corresponding Row Level Security (RLS) policies.

## Constraints
- **Student Privacy**: Budgets, academic history, timelines, and career goals must be restricted to the owner by default.
- **RLS Enforcement**: Every `CREATE TABLE` statement for user-owned data must be followed by `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
- **Policy Patterns**:
  - `CREATE POLICY "Users can view own data" ON table_name FOR SELECT USING (auth.uid() = user_id);`
  - `CREATE POLICY "Users can update own data" ON table_name FOR UPDATE USING (auth.uid() = user_id);`
- **Exception**: Publicly available data (e.g., university details, course lists) can have public read policies but restricted write policies.
