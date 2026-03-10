'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Profile, Classroom } from '@/lib/types';
import { Plus, Users, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function ClassroomPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

      const res = await fetch('/api/classroom');
      const data = await res.json();
      setClassrooms(data);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleJoin = async () => {
    setJoinError('');
    setJoining(true);

    const res = await fetch('/api/classroom/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: inviteCode }),
    });

    const data = await res.json();
    if (!res.ok) {
      setJoinError(data.error);
    } else {
      setShowJoin(false);
      setInviteCode('');
      // Reload classrooms
      const updated = await fetch('/api/classroom');
      setClassrooms(await updated.json());
    }
    setJoining(false);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Classrooms</h1>
        {profile?.role === 'teacher' ? (
          <Link href="/classroom/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Classroom
            </Button>
          </Link>
        ) : (
          <Button onClick={() => setShowJoin(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Join Classroom
          </Button>
        )}
      </div>

      {/* Join modal for students */}
      {showJoin && (
        <Card className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">
            Join a Classroom
          </h3>
          <div className="flex gap-3">
            <Input
              placeholder="Enter invite code (e.g., ABC123)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              error={joinError}
              className="uppercase tracking-widest"
            />
            <Button onClick={handleJoin} loading={joining}>
              Join
            </Button>
            <Button variant="ghost" onClick={() => setShowJoin(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {classrooms.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            {profile?.role === 'teacher'
              ? 'No classrooms yet. Create one to get started!'
              : 'You haven\'t joined any classrooms yet. Ask your teacher for an invite code.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {classrooms.map((classroom) => (
            <Card
              key={classroom.id}
              className="hover:border-indigo-200 transition-colors cursor-pointer"
              onClick={() => router.push(`/classroom/${classroom.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {classroom.name}
                  </h3>
                  {classroom.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {classroom.description}
                    </p>
                  )}
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              {profile?.role === 'teacher' && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Invite code:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {classroom.invite_code}
                  </code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCode(classroom.invite_code, classroom.id);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedId === classroom.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
