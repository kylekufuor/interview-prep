'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { UserRole, Specialty } from '@/lib/types';

const roles: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'student',
    label: 'Student',
    description: 'Practice mock interviews and get AI feedback',
  },
  {
    value: 'teacher',
    label: 'Bootcamp Owner / Teacher',
    description: 'Track student progress and manage classrooms',
  },
];

const specialties: { value: Specialty; label: string }[] = [
  { value: 'frontend', label: 'Frontend Engineering' },
  { value: 'backend', label: 'Backend Engineering' },
  { value: 'fullstack', label: 'Full Stack Engineering' },
  { value: 'data_engineering', label: 'Data Engineering' },
  { value: 'devops', label: 'DevOps Engineering' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
        specialty: selectedRole === 'student' ? selectedSpecialty : null,
      })
      .eq('id', user.id);

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Welcome!</h1>
          <p className="text-gray-600 mt-2">
            {step === 1
              ? 'How will you be using InterviewPrep?'
              : 'What area are you focusing on?'}
          </p>
        </div>

        <Card>
          {step === 1 && (
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all',
                    selectedRole === role.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="font-medium text-gray-900">{role.label}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {role.description}
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

          {step === 2 && (
            <div className="space-y-3">
              {specialties.map((spec) => (
                <button
                  key={spec.value}
                  onClick={() => setSelectedSpecialty(spec.value)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all',
                    selectedSpecialty === spec.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="font-medium text-gray-900">{spec.label}</div>
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
                  disabled={!selectedSpecialty}
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
