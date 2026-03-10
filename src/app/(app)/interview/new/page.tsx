'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  InterviewType,
  Field,
  Profile,
  JOB_TITLES,
  FIELD_LABELS,
} from '@/lib/types';
import { Mic, Code, Network, ClipboardPaste } from 'lucide-react';

const interviewTypes: {
  value: InterviewType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'behavioral',
    label: 'Behavioral',
    description: 'Soft skills, teamwork, leadership, conflict resolution',
    icon: Mic,
  },
  {
    value: 'technical',
    label: 'Technical',
    description: 'Problem solving, technical knowledge, practical skills',
    icon: Code,
  },
  {
    value: 'system_design',
    label: 'System Design',
    description: 'Architecture, scalability, trade-offs',
    icon: Network,
  },
];

export default function NewInterviewPage() {
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [field, setField] = useState<Field | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [useJD, setUseJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data as Profile);
        // Pre-fill from profile
        if (data.field) setField(data.field as Field);
        if (data.job_title) setJobTitle(data.job_title);
      }
    };
    loadProfile();
  }, [supabase]);

  const handleStart = async () => {
    if (!selectedType || !jobTitle || !field) return;
    setLoading(true);

    const res = await fetch('/api/interview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interview_type: selectedType,
        job_title: jobTitle,
        field,
        job_description: useJD ? jobDescription : undefined,
      }),
    });

    const data = await res.json();
    if (data.interview_id) {
      router.push(`/interview/${data.interview_id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Start a Mock Interview
      </h1>

      <div className="space-y-6">
        {/* Interview Type */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            Interview Type
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {interviewTypes.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSelectedType(value)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  selectedType === value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 mb-2',
                    selectedType === value
                      ? 'text-indigo-600'
                      : 'text-gray-400'
                  )}
                />
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Field */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Field</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FIELD_LABELS) as Field[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setField(f);
                  // Reset job title if changing field and current title isn't in new field
                  if (!JOB_TITLES[f].includes(jobTitle)) {
                    setJobTitle('');
                  }
                }}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  field === f
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {FIELD_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Job Title */}
        {field && (
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Target Role
            </h2>
            <div className="flex flex-wrap gap-2">
              {JOB_TITLES[field].map((title) => (
                <button
                  key={title}
                  onClick={() => setJobTitle(title)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border-2 text-sm transition-all',
                    jobTitle === title
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Job Description Toggle */}
        <div>
          <button
            onClick={() => setUseJD(!useJD)}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ClipboardPaste className="h-4 w-4" />
            {useJD
              ? 'Remove job description'
              : 'Paste a job description (optional)'}
          </button>
          {useJD && (
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here. The AI will tailor interview questions to match the specific requirements, technologies, and responsibilities listed..."
              className="mt-3 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[160px] resize-y"
            />
          )}
        </div>

        {/* Voice hint */}
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex gap-3">
            <Mic className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Voice-enabled interview</p>
              <p className="mt-1">
                Your browser will ask for microphone access. You can speak your
                answers naturally, or type them. The AI interviewer will speak
                its questions aloud.
              </p>
            </div>
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full"
          disabled={!selectedType || !jobTitle || !field}
          loading={loading}
          onClick={handleStart}
        >
          Start Interview
        </Button>
      </div>
    </div>
  );
}
