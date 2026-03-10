'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getInterviewTypeLabel, getFieldLabel, formatDate } from '@/lib/utils';
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Analysis, Interview, Message } from '@/lib/types';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [interviewRes, analysisRes, messagesRes] = await Promise.all([
        supabase.from('interviews').select('*').eq('id', id).single(),
        supabase.from('analyses').select('*').eq('interview_id', id).single(),
        supabase
          .from('messages')
          .select('*')
          .eq('interview_id', id)
          .order('created_at', { ascending: true }),
      ]);

      if (interviewRes.data) setInterview(interviewRes.data);
      if (analysisRes.data) setAnalysis(analysisRes.data);
      if (messagesRes.data) {
        // Filter out the hidden kickoff message
        setMessages(
          messagesRes.data.filter(
            (m) => !m.content.includes('The interview is starting now')
          )
        );
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

  if (!interview || !analysis) {
    return (
      <div className="text-center py-12 text-gray-500">
        Analysis not available yet.
      </div>
    );
  }

  const scoreColor =
    analysis.overall_score >= 8
      ? 'text-green-600'
      : analysis.overall_score >= 6
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interview Review</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="info">
            {getInterviewTypeLabel(interview.interview_type)}
          </Badge>
          <Badge>{interview.job_title}</Badge>
          <span className="text-sm text-gray-500">
            {getFieldLabel(interview.field)} &middot;{' '}
            {formatDate(interview.started_at)}
          </span>
        </div>
      </div>

      {/* Score */}
      <Card className="text-center">
        <p className="text-sm text-gray-500 mb-1">Overall Score</p>
        <p className={`text-6xl font-bold ${scoreColor}`}>
          {analysis.overall_score}
          <span className="text-2xl text-gray-400">/10</span>
        </p>
      </Card>

      {/* Summary */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Summary</h2>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {analysis.summary}
        </p>
      </Card>

      {/* Strengths */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">Strengths</h2>
        </div>
        <ul className="space-y-2">
          {(analysis.strengths as string[]).map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <span className="text-green-500 mt-0.5">+</span>
              {s}
            </li>
          ))}
        </ul>
      </Card>

      {/* Weaknesses */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-gray-900">Areas for Improvement</h2>
        </div>
        <ul className="space-y-2">
          {(analysis.weaknesses as string[]).map((w, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <span className="text-amber-500 mt-0.5">-</span>
              {w}
            </li>
          ))}
        </ul>
      </Card>

      {/* Suggestions */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Suggestions</h2>
        </div>
        <ul className="space-y-2">
          {(analysis.suggestions as string[]).map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <span className="text-indigo-500 font-bold mt-0.5">
                {i + 1}.
              </span>
              {s}
            </li>
          ))}
        </ul>
      </Card>

      {/* Transcript */}
      <Card padding="none">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between p-6"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Full Transcript</h2>
            <span className="text-xs text-gray-400">
              ({messages.length} messages)
            </span>
          </div>
          {showTranscript ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {showTranscript && (
          <div className="border-t border-gray-200 p-6 space-y-4 max-h-96 overflow-auto">
            {messages.map((msg, i) => (
              <div key={i}>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {msg.role === 'assistant' ? 'Interviewer' : 'You'}
                </p>
                <p className="text-sm text-gray-700">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
