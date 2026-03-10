'use client';

import { cn } from '@/lib/utils';

interface InterviewerAvatarProps {
  isSpeaking: boolean;
  interviewerName?: string;
}

export default function InterviewerAvatar({
  isSpeaking,
  interviewerName = 'Alex Chen',
}: InterviewerAvatarProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Avatar with speaking animation */}
      <div className="relative">
        <div
          className={cn(
            'w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold transition-all duration-300',
            isSpeaking && 'ring-4 ring-indigo-300 ring-opacity-60'
          )}
        >
          {interviewerName
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        {/* Speaking indicator rings */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-20" />
            <div
              className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-10"
              style={{ animationDelay: '0.5s' }}
            />
          </>
        )}
      </div>
      <div className="mt-3 text-center">
        <p className="font-medium text-gray-900">{interviewerName}</p>
        <p className="text-xs text-gray-500">Senior Engineer</p>
        {isSpeaking && (
          <div className="flex items-center gap-1 justify-center mt-2">
            <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" />
            <div
              className="w-1 h-4 bg-indigo-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.15s' }}
            />
            <div
              className="w-1 h-2 bg-indigo-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.3s' }}
            />
            <div
              className="w-1 h-5 bg-indigo-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.45s' }}
            />
            <div
              className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.6s' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
