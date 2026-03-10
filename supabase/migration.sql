-- ============================================
-- Interview Prep App - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT CHECK (role IN ('student', 'teacher')),
  field TEXT CHECK (field IN ('devops', 'cyber_security', 'project_management', 'data', 'business_intelligence')),
  job_title TEXT,
  experience_level TEXT CHECK (experience_level IN ('0-1', '1-3', '3-5', '5-10', '10+')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Classroom Members
CREATE TABLE classroom_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

-- Interviews
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('behavioral', 'technical', 'system_design')),
  job_title TEXT NOT NULL,
  field TEXT NOT NULL CHECK (field IN ('devops', 'cyber_security', 'project_management', 'data', 'business_intelligence')),
  job_description TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'analyzed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Messages (interview transcript)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analysis (one per interview)
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID UNIQUE NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 1 AND 10),
  strengths JSONB NOT NULL DEFAULT '[]',
  weaknesses JSONB NOT NULL DEFAULT '[]',
  suggestions JSONB NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_messages_interview ON messages(interview_id, created_at);
CREATE INDEX idx_interviews_student ON interviews(student_id, started_at DESC);
CREATE INDEX idx_classroom_members_classroom ON classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_student ON classroom_members(student_id);

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Auto-update updated_at on profiles
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Teachers can read profiles of students in their classrooms
CREATE POLICY "Teachers can read student profiles"
  ON profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classroom_members cm
      JOIN classrooms c ON c.id = cm.classroom_id
      WHERE cm.student_id = profiles.id
      AND c.teacher_id = auth.uid()
    )
  );

-- Classrooms: teachers manage their own, students read joined
CREATE POLICY "Teachers can CRUD own classrooms"
  ON classrooms FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Students can read joined classrooms"
  ON classrooms FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classroom_members
      WHERE classroom_id = classrooms.id
      AND student_id = auth.uid()
    )
  );

-- Allow reading classrooms by invite code (for joining)
CREATE POLICY "Anyone authenticated can read by invite code"
  ON classrooms FOR SELECT USING (auth.uid() IS NOT NULL);

-- Classroom Members
CREATE POLICY "Teachers can manage classroom members"
  ON classroom_members FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE id = classroom_members.classroom_id
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can join classrooms"
  ON classroom_members FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can read own memberships"
  ON classroom_members FOR SELECT USING (student_id = auth.uid());

-- Interviews: students own their data
CREATE POLICY "Students can CRUD own interviews"
  ON interviews FOR ALL USING (student_id = auth.uid());

-- Teachers can read interviews of their classroom students
CREATE POLICY "Teachers can read student interviews"
  ON interviews FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classroom_members cm
      JOIN classrooms c ON c.id = cm.classroom_id
      WHERE cm.student_id = interviews.student_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Messages: follow interview access
CREATE POLICY "Students can manage own messages"
  ON messages FOR ALL USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE id = messages.interview_id
      AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can read student messages"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interviews i
      JOIN classroom_members cm ON cm.student_id = i.student_id
      JOIN classrooms c ON c.id = cm.classroom_id
      WHERE i.id = messages.interview_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Analyses: follow interview access
CREATE POLICY "Students can read own analyses"
  ON analyses FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE id = analyses.interview_id
      AND student_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert own analyses"
  ON analyses FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE id = analyses.interview_id
      AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can read student analyses"
  ON analyses FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interviews i
      JOIN classroom_members cm ON cm.student_id = i.student_id
      JOIN classrooms c ON c.id = cm.classroom_id
      WHERE i.id = analyses.interview_id
      AND c.teacher_id = auth.uid()
    )
  );
