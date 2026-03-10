import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isAssistant = role === 'assistant';

  return (
    <div className={cn('flex', isAssistant ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isAssistant
            ? 'bg-white border border-gray-200 text-gray-800'
            : 'bg-indigo-600 text-white'
        )}
      >
        {content}
      </div>
    </div>
  );
}
