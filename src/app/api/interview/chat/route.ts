import { NextRequest } from 'next/server';
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
    return new Response('Unauthorized', { status: 401 });
  }

  const { interview_id, message } = (await request.json()) as {
    interview_id: string;
    message: string;
  };

  // Fetch interview details
  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', interview_id)
    .eq('student_id', user.id)
    .single();

  if (!interview) {
    return new Response('Interview not found', { status: 404 });
  }

  // Save user message
  await supabase.from('messages').insert({
    interview_id,
    role: 'user',
    content: message,
  });

  // Load conversation history
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('interview_id', interview_id)
    .order('created_at', { ascending: true });

  const conversationHistory = (messages || []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const systemPrompt = buildInterviewSystemPrompt(
    interview.interview_type as InterviewType,
    interview.role_type as Specialty
  );

  // Stream response from Claude
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: conversationHistory,
  });

  // Collect full response while streaming
  let fullResponse = '';

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const text = event.delta.text;
          fullResponse += text;
          controller.enqueue(encoder.encode(text));
        }
      }

      // Save assistant response after streaming completes
      await supabase.from('messages').insert({
        interview_id,
        role: 'assistant',
        content: fullResponse,
      });

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
