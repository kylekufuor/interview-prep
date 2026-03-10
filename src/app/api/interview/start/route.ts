import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import anthropic from '@/lib/claude';
import { buildInterviewSystemPrompt } from '@/lib/prompts';
import { InterviewType, Specialty } from '@/lib/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { interview_type, role_type } = (await request.json()) as {
    interview_type: InterviewType;
    role_type: Specialty;
  };

  // Create interview record
  const { data: interview, error: dbError } = await supabase
    .from('interviews')
    .insert({
      student_id: user.id,
      interview_type,
      role_type,
      status: 'in_progress',
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Get first message from Claude
  const systemPrompt = buildInterviewSystemPrompt(interview_type, role_type);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content:
          'The interview is starting now. Please introduce yourself and begin.',
      },
    ],
  });

  const firstMessage =
    response.content[0].type === 'text' ? response.content[0].text : '';

  // Save the initial exchange
  await supabase.from('messages').insert([
    {
      interview_id: interview.id,
      role: 'user',
      content:
        'The interview is starting now. Please introduce yourself and begin.',
    },
    {
      interview_id: interview.id,
      role: 'assistant',
      content: firstMessage,
    },
  ]);

  return NextResponse.json({
    interview_id: interview.id,
    first_message: firstMessage,
  });
}
