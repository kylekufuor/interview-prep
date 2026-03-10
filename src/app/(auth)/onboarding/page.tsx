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
import {
  User,
  Users,
  Shield,
  Server,
  FolderKanban,
  Database,
  BarChart3,
  Mic,
  Briefcase,
  Clock,
  Target,
} from 'lucide-react';

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
  description: string;
}[] = [
  { value: 'devops', label: 'DevOps', icon: Server, description: 'CI/CD, cloud, infrastructure' },
  { value: 'cyber_security', label: 'Cyber Security', icon: Shield, description: 'Threat detection, compliance' },
  { value: 'project_management', label: 'Project Management', icon: FolderKanban, description: 'Agile, delivery, stakeholders' },
  { value: 'data', label: 'Data', icon: Database, description: 'Analytics, ML, data engineering' },
  { value: 'business_intelligence', label: 'Business Intelligence', icon: BarChart3, description: 'Dashboards, reporting, BI tools' },
];

const experienceOptions: ExperienceLevel[] = ['0-1', '1-3', '3-5', '5-10', '10+'];

const stepIcons = [Target, Briefcase, User, Clock];
const stepTitles = [
  'What brings you here?',
  'What field are you targeting?',
  'What role are you interviewing for?',
  'How much experience do you have?',
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] =
    useState<ExperienceLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const totalSteps = selectedRole === 'teacher' ? 1 : 4;

  const animateStep = (nextStep: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setTransitioning(false);
    }, 200);
  };

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

  const StepIcon = stepIcons[step - 1];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 animate-[fade-down_0.6s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">InterviewPrep</span>
          </div>

          {/* Step icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <StepIcon className="h-7 w-7 text-indigo-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{stepTitles[step - 1]}</h1>

          {/* Progress bar */}
          {selectedRole !== 'teacher' && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    i + 1 <= step ? 'bg-indigo-600 w-10' : 'bg-gray-200 w-6'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            'transition-all duration-200',
            transitioning
              ? 'opacity-0 translate-y-2'
              : 'opacity-100 translate-y-0'
          )}
        >
          <Card>
            {/* Step 1: Purpose */}
            {step === 1 && (
              <div className="space-y-3">
                {purposeOptions.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedRole(value)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 hover-lift',
                      selectedRole === value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2.5 rounded-xl mt-0.5 transition-colors',
                        selectedRole === value
                          ? 'bg-indigo-100'
                          : 'bg-gray-100'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-colors',
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
                      animateStep(2);
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
                {fieldOptions.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSelectedField(value);
                      setSelectedJobTitle(null);
                    }}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 hover-lift',
                      selectedField === value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        selectedField === value
                          ? 'text-indigo-600'
                          : 'text-gray-400'
                      )}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">{description}</div>
                    </div>
                  </button>
                ))}
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => animateStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!selectedField}
                    onClick={() => animateStep(3)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Job Title */}
            {step === 3 && selectedField && (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
                  {FIELD_LABELS[selectedField]} roles
                </div>
                <div className="max-h-80 overflow-auto space-y-2 pr-1">
                  {JOB_TITLES[selectedField].map((title) => (
                    <button
                      key={title}
                      onClick={() => setSelectedJobTitle(title)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm hover-lift',
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
                    onClick={() => animateStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!selectedJobTitle}
                    onClick={() => animateStep(4)}
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
                      'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 hover-lift',
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
                    onClick={() => animateStep(3)}
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
    </div>
  );
}
