'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  getFieldLabel,
  formatDate,
} from '@/lib/utils';
import { Copy, Check, Users } from 'lucide-react';
import { Classroom, Profile } from '@/lib/types';

interface StudentWithStats {
  profile: Profile;
  interview_count: number;
  avg_score: number | null;
  latest_interview: string | null;
}

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setUserRole(profile?.role || '');

      // Get classroom
      const { data: classroomData } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', id)
        .single();
      setClassroom(classroomData);

      // Get members
      const { data: members } = await supabase
        .from('classroom_members')
        .select('student_id')
        .eq('classroom_id', id);

      if (members && members.length > 0) {
        const studentIds = members.map((m) => m.student_id);

        // Get profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', studentIds);

        // Get interview stats for each student
        const studentsWithStats: StudentWithStats[] = await Promise.all(
          (profiles || []).map(async (p) => {
            const { data: interviews } = await supabase
              .from('interviews')
              .select('id, started_at, analyses(overall_score)')
              .eq('student_id', p.id)
              .order('started_at', { ascending: false });

            const analyzed = (interviews || []).filter(
              (i: any) => i.analyses && i.analyses.length > 0
            );
            const avgScore =
              analyzed.length > 0
                ? analyzed.reduce(
                    (sum: number, i: any) =>
                      sum + (i.analyses[0]?.overall_score || 0),
                    0
                  ) / analyzed.length
                : null;

            return {
              profile: p as Profile,
              interview_count: interviews?.length || 0,
              avg_score: avgScore,
              latest_interview: interviews?.[0]?.started_at || null,
            };
          })
        );

        setStudents(studentsWithStats);
      }

      setLoading(false);
    };
    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!classroom) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{classroom.name}</h1>
        {classroom.description && (
          <p className="text-gray-500 mt-1">{classroom.description}</p>
        )}
        {userRole === 'teacher' && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-gray-500">Invite code:</span>
            <code className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-sm tracking-wider">
              {classroom.invite_code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(classroom.invite_code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">
          Students ({students.length})
        </h2>
      </div>

      {students.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            No students have joined yet. Share the invite code with your
            students.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Card key={student.profile.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {student.profile.full_name || student.profile.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {student.profile.job_title && (
                      <Badge>
                        {student.profile.job_title}
                      </Badge>
                    )}
                    {student.profile.field && (
                      <Badge variant="info">
                        {getFieldLabel(student.profile.field)}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {student.interview_count} interviews
                    </span>
                    {student.latest_interview && (
                      <span className="text-xs text-gray-400">
                        Last: {formatDate(student.latest_interview)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {student.avg_score !== null ? (
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {student.avg_score.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-400">/10</span>
                      <p className="text-xs text-gray-500">avg score</p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No scores yet</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
