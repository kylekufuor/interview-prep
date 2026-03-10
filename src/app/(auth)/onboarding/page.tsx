'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  UserRole,
  Field,
  ExperienceLevel,
  JOB_TITLES,
  FIELD_LABELS,
  EXPERIENCE_LABELS,
} from '@/lib/types';
import { User, Users, Shield, Server, FolderKanban, Database, BarChart3 } from 'lucide-react';

const purposeOptions: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'student',
    label: "I'm preparing for interviews",
    description: 'Practice with AI mock interviews and get detailed feedback',
    icon: User,
  },
  {
    value: 'teacher',
    label: "I'm helping others prepare",
    description: 'Manage students, track progress, and view analytics',
    icon: Users,
  },
];

const fieldOptions: {
  value: Field;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'devops', label: 'DevOps', icon: Server },
  { value: 'cyber_security', label: 'Cyber Security', icon: Shield },
  { value: 'project_management', label: 'Project Management', icon: FolderKanban },
  { value: 'data', label: 'Data', icon: Database },
  { value: 'business_intelligence', label: 'Business Intelligence', icon: BarChart3 },
];

const experienceOptions: ExperienceLevel[] = ['0-1', '1-3', '3-5', '5-10', '10+'];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] =
    useState<ExperienceLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const totalSteps = selectedRole === 'teacher' ? 1 : 4;

  const handleComplete = async () => {
    if (!selectedRole) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        role: selectedRole,
        field: selectedRole === 'student' ? selectedField : null,
        job_title: selectedRole === 'student' ? selectedJobTitle : null,
        experience_level: selectedRole === 'student' ? selectedExperience : null,
      })
      .eq('id', user.id);

    router.push('/dashboard');
  };

  const stepTitles = [
    'What brings you here?',
    'What field are you targeting?',
    'What role are you interviewing for?',
    'How much experience do you have?',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Welcome!</h1>
          <p className="text-gray-600 mt-2">{stepTitles[step - 1]}</p>
          {selectedRole === 'student' && step > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i + 1 <= step ? 'bg-indigo-600 w-8' : 'bg-gray-200 w-4'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <Card>
          {/* Step 1: Purpose */}
          {step === 1 && (
            <div className="space-y-3">
              {purposeOptions.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedRole(value)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-4',
                    selectedRole === value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg mt-0.5',
                      selectedRole === value
                        ? 'bg-indigo-100'
                        : 'bg-gray-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        selectedRole === value
                          ? 'text-indigo-600'
                          : 'text-gray-400'
                      )}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {description}
                    </div>
                  </div>
                </button>
              ))}
              <Button
                className="w-full mt-4"
                disabled={!selectedRole}
                onClick={() => {
                  if (selectedRole === 'teacher') {
                    handleComplete();
                  } else {
                    setStep(2);
                  }
                }}
                loading={loading}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Field */}
          {step === 2 && (
            <div className="space-y-3">
              {fieldOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedField(value);
                    setSelectedJobTitle(null); // reset job title when field changes
                  }}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-4',
                    selectedField === value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      selectedField === value
                        ? 'text-indigo-600'
                        : 'text-gray-400'
                    )}
                  />
                  <div className="font-medium text-gray-900">{label}</div>
                </button>
              ))}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedField}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Job Title */}
          {step === 3 && selectedField && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 mb-2">
                {FIELD_LABELS[selectedField]} roles
              </div>
              <div className="max-h-80 overflow-auto space-y-2 pr-1">
                {JOB_TITLES[selectedField].map((title) => (
                  <button
                    key={title}
                    onClick={() => setSelectedJobTitle(title)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm',
                      selectedJobTitle === title
                        ? 'border-indigo-600 bg-indigo-50 font-medium text-indigo-900'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    )}
                  >
                    {title}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedJobTitle}
                  onClick={() => setStep(4)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Experience Level */}
          {step === 4 && (
            <div className="space-y-3">
              {experienceOptions.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedExperience(level)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
                    selectedExperience === level
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {EXPERIENCE_LABELS[level]}
                  </div>
                </button>
              ))}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(3)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!selectedExperience}
                  onClick={handleComplete}
                  loading={loading}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
