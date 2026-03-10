import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import anthropic from '@/lib/claude';
import { buildAnalysisPrompt } from '@/lib/prompts';
import { InterviewType, Field } from '@/lib/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { interview_id } = (await request.json()) as {
    interview_id: string;
  };

  // Fetch interview
  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', interview_id)
    .eq('student_id', user.id)
    .single();

  if (!interview) {
    return NextResponse.json(
      { error: 'Interview not found' },
      { status: 404 }
    );
  }

  // Get user profile for experience level
  const { data: profile } = await supabase
    .from('profiles')
    .select('experience_level')
    .eq('id', user.id)
    .single();

  // Mark interview as completed
  await supabase
    .from('interviews')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', interview_id);

  // Load full transcript
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('interview_id', interview_id)
    .order('created_at', { ascending: true });

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No transcript found' }, { status: 400 });
  }

  // Generate analysis with Claude
  const analysisPrompt = buildAnalysisPrompt(
    {
      interviewType: interview.interview_type as InterviewType,
      field: interview.field as Field,
      jobTitle: interview.job_title,
      experienceLevel: profile?.experience_level || undefined,
      jobDescription: interview.job_description || undefined,
    },
    messages
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: analysisPrompt }],
  });

  const responseText =
    response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON response
  let analysis;
  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    analysis = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse analysis' },
      { status: 500 }
    );
  }

  // Save analysis
  const { data: savedAnalysis, error: saveError } = await supabase
    .from('analyses')
    .insert({
      interview_id,
      overall_score: analysis.overall_score,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions,
      summary: analysis.summary,
    })
    .select()
    .single();

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 });
  }

  // Update interview status
  await supabase
    .from('interviews')
    .update({ status: 'analyzed' })
    .eq('id', interview_id);

  return NextResponse.json({ analysis: savedAnalysis });
}
