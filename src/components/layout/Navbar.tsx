'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Profile } from '@/lib/types';

export default function Navbar({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-indigo-600">InterviewPrep</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {profile.full_name || profile.email}
        </span>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full capitalize">
          {profile.role}
        </span>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </nav>
  );
}
