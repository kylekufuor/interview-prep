import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInviteCode } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description } = await request.json();

  const { data, error } = await supabase
    .from('classrooms')
    .insert({
      teacher_id: user.id,
      name,
      description,
      invite_code: generateInviteCode(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'teacher') {
    const { data } = await supabase
      .from('classrooms')
      .select('*, classroom_members(count)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json(data || []);
  } else {
    // Student: get classrooms they're a member of
    const { data: memberships } = await supabase
      .from('classroom_members')
      .select('classroom_id')
      .eq('student_id', user.id);

    if (!memberships || memberships.length === 0) {
      return NextResponse.json([]);
    }

    const classroomIds = memberships.map((m) => m.classroom_id);
    const { data } = await supabase
      .from('classrooms')
      .select('*')
      .in('id', classroomIds);

    return NextResponse.json(data || []);
  }
}
