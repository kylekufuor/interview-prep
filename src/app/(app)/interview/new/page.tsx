'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { InterviewType, Specialty } from '@/lib/types';
import { Mic, Code, Network } from 'lucide-react';

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
    description: 'Coding problems, algorithms, data structures',
    icon: Code,
  },
  {
    value: 'system_design',
    label: 'System Design',
    description: 'Architecture, scalability, trade-offs',
    icon: Network,
  },
];

const roleTypes: { value: Specialty; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'data_engineering', label: 'Data Engineering' },
  { value: 'devops', label: 'DevOps' },
];

export default function NewInterviewPage() {
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [selectedRole, setSelectedRole] = useState<Specialty | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (!selectedType || !selectedRole) return;
    setLoading(true);

    const res = await fetch('/api/interview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interview_type: selectedType,
        role_type: selectedRole,
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

        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Role</h2>
          <div className="flex flex-wrap gap-2">
            {roleTypes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedRole(value)}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  selectedRole === value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

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
          disabled={!selectedType || !selectedRole}
          loading={loading}
          onClick={handleStart}
        >
          Start Interview
        </Button>
      </div>
    </div>
  );
}
