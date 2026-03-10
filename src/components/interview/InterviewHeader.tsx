'use client';

import { useState, useEffect } from 'react';
import { formatDuration, getInterviewTypeLabel } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { Clock } from 'lucide-react';

interface InterviewHeaderProps {
  interviewType: string;
  jobTitle: string;
  messageCount: number;
}

export default function InterviewHeader({
  interviewType,
  jobTitle,
  messageCount,
}: InterviewHeaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Rough question count (assistant messages minus the intro)
  const questionCount = Math.max(0, Math.ceil((messageCount - 1) / 2));

  return (
    <div className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge variant="info">{getInterviewTypeLabel(interviewType)}</Badge>
        <Badge>{jobTitle}</Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Q{questionCount} of ~8</span>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatDuration(elapsed)}
        </div>
      </div>
    </div>
  );
}
