'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  getInterviewTypeLabel,
  getFieldLabel,
  formatDate,
} from '@/lib/utils';
import { Profile, Interview, Analysis } from '@/lib/types';
import { Plus, TrendingUp, BookOpen, Target } from 'lucide-react';
import Link from 'next/link';

interface InterviewRow extends Interview {
  analyses: Analysis[];
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      if (profileData?.role === 'student') {
        const { data: interviewData } = await supabase
          .from('interviews')
          .select('*, analyses(*)')
          .eq('student_id', user.id)
          .order('started_at', { ascending: false });

        setInterviews((interviewData as InterviewRow[]) || []);
      }

      setLoading(false);
    };
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  // Teacher dashboard
  if (profile.role === 'teacher') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Mentor Dashboard
          </h1>
          <Link href="/classroom/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Classroom
            </Button>
          </Link>
        </div>
        <Card>
          <p className="text-gray-500 text-sm">
            Create a classroom and invite students to get started. You&apos;ll
            be able to track their interview scores and progress here.
          </p>
          <Link href="/classroom" className="text-indigo-600 text-sm mt-2 block">
            Go to Classrooms →
          </Link>
        </Card>
      </div>
    );
  }

  // Student dashboard
  const completedInterviews = interviews.filter(
    (i) => i.status === 'analyzed'
  );
  const avgScore =
    completedInterviews.length > 0
      ? completedInterviews.reduce(
          (sum, i) => sum + (i.analyses[0]?.overall_score || 0),
          0
        ) / completedInterviews.length
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/interview/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.length}
              </p>
              <p className="text-xs text-gray-500">Total Interviews</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {avgScore.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {completedInterviews.length}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Interview history */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Interview History
      </h2>
      {interviews.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            No interviews yet. Start your first mock interview!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const analysis = interview.analyses[0];
            const scoreColor = analysis
              ? analysis.overall_score >= 8
                ? 'success'
                : analysis.overall_score >= 6
                  ? 'warning'
                  : 'danger'
              : 'default';

            return (
              <Card
                key={interview.id}
                className="hover:border-indigo-200 cursor-pointer hover-lift"
                onClick={() => {
                  if (interview.status === 'analyzed') {
                    router.push(`/review/${interview.id}`);
                  } else if (interview.status === 'in_progress') {
                    router.push(`/interview/${interview.id}`);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="info">
                          {getInterviewTypeLabel(interview.interview_type)}
                        </Badge>
                        <Badge>
                          {interview.job_title}
                        </Badge>
                        <Badge
                          variant={
                            interview.status === 'analyzed'
                              ? 'success'
                              : interview.status === 'in_progress'
                                ? 'warning'
                                : 'default'
                          }
                        >
                          {interview.status === 'in_progress'
                            ? 'In Progress'
                            : interview.status === 'analyzed'
                              ? 'Complete'
                              : 'Analyzing...'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {getFieldLabel(interview.field)} &middot;{' '}
                        {formatDate(interview.started_at)}
                      </p>
                    </div>
                  </div>
                  {analysis && (
                    <div className="text-right">
                      <Badge variant={scoreColor as 'success' | 'warning' | 'danger'}>
                        Score: {analysis.overall_score}/10
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
