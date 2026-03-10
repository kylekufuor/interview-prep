export type UserRole = 'student' | 'teacher';

export type Field =
  | 'devops'
  | 'cyber_security'
  | 'project_management'
  | 'data'
  | 'business_intelligence';

export type InterviewType = 'behavioral' | 'technical' | 'system_design';

export type InterviewStatus = 'in_progress' | 'completed' | 'analyzed';

export type MessageRole = 'user' | 'assistant';

export type ExperienceLevel = '0-1' | '1-3' | '3-5' | '5-10' | '10+';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  field: Field | null;
  job_title: string | null;
  experience_level: ExperienceLevel | null;
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
  job_title: string;
  field: Field;
  job_description: string | null;
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

// Job titles grouped by field
export const JOB_TITLES: Record<Field, string[]> = {
  devops: [
    'DevOps Engineer',
    'Site Reliability Engineer',
    'Cloud Engineer',
    'Platform Engineer',
    'Infrastructure Engineer',
    'Release Engineer',
    'Build Engineer',
    'Systems Engineer',
    'Cloud Architect',
    'Automation Engineer',
  ],
  cyber_security: [
    'Security Analyst',
    'Security Engineer',
    'Penetration Tester',
    'SOC Analyst',
    'Information Security Analyst',
    'Threat Intelligence Analyst',
    'Security Architect',
    'Application Security Engineer',
    'Cloud Security Engineer',
    'Incident Response Analyst',
  ],
  project_management: [
    'Technical Project Manager',
    'Scrum Master',
    'Product Manager',
    'Program Manager',
    'Agile Coach',
    'Delivery Manager',
    'IT Project Manager',
    'Release Train Engineer',
    'PMO Analyst',
    'Engineering Manager',
  ],
  data: [
    'Data Analyst',
    'Data Engineer',
    'Data Scientist',
    'ML Engineer',
    'Database Administrator',
    'Analytics Engineer',
    'Data Architect',
    'MLOps Engineer',
    'Research Scientist',
    'Data Platform Engineer',
  ],
  business_intelligence: [
    'BI Analyst',
    'BI Developer',
    'Analytics Engineer',
    'Reporting Analyst',
    'BI Architect',
    'Data Visualization Specialist',
    'Power BI Developer',
    'Tableau Developer',
    'Business Analyst',
    'Insights Analyst',
  ],
};

export const FIELD_LABELS: Record<Field, string> = {
  devops: 'DevOps',
  cyber_security: 'Cyber Security',
  project_management: 'Project Management',
  data: 'Data',
  business_intelligence: 'Business Intelligence',
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  '0-1': '0-1 years',
  '1-3': '1-3 years',
  '3-5': '3-5 years',
  '5-10': '5-10 years',
  '10+': '10+ years',
};
