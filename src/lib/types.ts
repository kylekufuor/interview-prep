export type UserRole = 'student' | 'teacher';

export type Specialty =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'data_engineering'
  | 'devops';

export type InterviewType = 'behavioral' | 'technical' | 'system_design';

export type InterviewStatus = 'in_progress' | 'completed' | 'analyzed';

export type MessageRole = 'user' | 'assistant';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  specialty: Specialty | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  invite_code: string;
  description: string | null;
  created_at: string;
}

export interface ClassroomMember {
  id: string;
  classroom_id: string;
  student_id: string;
  joined_at: string;
}

export interface Interview {
  id: string;
  student_id: string;
  interview_type: InterviewType;
  role_type: Specialty;
  status: InterviewStatus;
  started_at: string;
  completed_at: string | null;
}

export interface Message {
  id: string;
  interview_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface Analysis {
  id: string;
  interview_id: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  created_at: string;
}

// Join types for queries
export interface ClassroomWithMembers extends Classroom {
  members: (ClassroomMember & { profile: Profile })[];
}

export interface InterviewWithAnalysis extends Interview {
  analysis: Analysis | null;
}

export interface InterviewWithMessages extends Interview {
  messages: Message[];
}
