-- ============================================
-- Migration: Update fields and job titles
-- Replaces specialty with field, job_title, experience_level
-- Updates interviews to use job_title + field + job_description
-- ============================================

-- 1. Update profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS specialty;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS field TEXT CHECK (field IN ('devops', 'cyber_security', 'project_management', 'data', 'business_intelligence'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('0-1', '1-3', '3-5', '5-10', '10+'));

-- 2. Update interviews table
ALTER TABLE interviews DROP COLUMN IF EXISTS role_type;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS job_title TEXT NOT NULL DEFAULT 'General';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS field TEXT NOT NULL DEFAULT 'data' CHECK (field IN ('devops', 'cyber_security', 'project_management', 'data', 'business_intelligence'));
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS job_description TEXT;

-- Remove the default after migration (for new rows they'll always be provided)
ALTER TABLE interviews ALTER COLUMN job_title DROP DEFAULT;
ALTER TABLE interviews ALTER COLUMN field DROP DEFAULT;
