import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { invite_code } = await request.json();

  // Find classroom by invite code
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('invite_code', invite_code.toUpperCase())
    .single();

  if (!classroom) {
    return NextResponse.json(
      { error: 'Invalid invite code' },
      { status: 404 }
    );
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('classroom_members')
    .select('id')
    .eq('classroom_id', classroom.id)
    .eq('student_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Already a member of this classroom' },
      { status: 400 }
    );
  }

  // Join
  const { error } = await supabase.from('classroom_members').insert({
    classroom_id: classroom.id,
    student_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ classroom });
}
