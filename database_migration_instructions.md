# Database Migration Instructions

## Modifying the mifid_responses table

If you already have the `mifid_responses` table in your Supabase database, follow these steps to update it without losing data:

### Option 1: If the table is empty (no data yet)

Run this SQL in Supabase SQL Editor:

```sql
-- Drop the old table
DROP TABLE IF EXISTS mifid_responses CASCADE;

-- Create the new table with updated structure
CREATE TABLE mifid_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_1_answer TEXT NOT NULL,
  question_2_answer TEXT NOT NULL,
  question_3_answer TEXT NOT NULL,
  question_4_answer TEXT NOT NULL,
  question_5_answer TEXT NOT NULL,
  question_6_answer TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  investor_profile TEXT NOT NULL CHECK (investor_profile IN ('cautious', 'stable', 'balanced', 'dynamic')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Re-enable RLS
ALTER TABLE mifid_responses ENABLE ROW LEVEL SECURITY;

-- Re-create policies
CREATE POLICY "Users can view own mifid" ON mifid_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mifid" ON mifid_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mifid" ON mifid_responses FOR UPDATE USING (auth.uid() = user_id);
```

### Option 2: If the table doesn't exist yet

Simply run the full schema from `supabase_schema.sql` file.

### Option 3: If you have data and want to preserve it

This is more complex and requires a custom migration based on your existing data structure. Contact me if you need help with this scenario.

## Verification

After running the migration, verify the table structure:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mifid_responses'
ORDER BY ordinal_position;
```

You should see columns:

- id (uuid)
- user_id (uuid)
- question_1_answer (text)
- question_2_answer (text)
- question_3_answer (text)
- question_4_answer (text)
- question_5_answer (text)
- question_6_answer (text)
- total_score (integer)
- investor_profile (text)
- completed_at (timestamp with time zone)
