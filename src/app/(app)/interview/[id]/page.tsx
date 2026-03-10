'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SpeechManager } from '@/lib/speech';
import InterviewerAvatar from '@/components/interview/InterviewerAvatar';
import InterviewHeader from '@/components/interview/InterviewHeader';
import MessageBubble from '@/components/interview/MessageBubble';
import Button from '@/components/ui/Button';
import CodeEditor from '@/components/interview/CodeEditor';
import Whiteboard from '@/components/interview/Whiteboard';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Send, Square, Keyboard } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [useVoice, setUseVoice] = useState(true);
  const [interview, setInterview] = useState<{
    interview_type: string;
    job_title: string;
    field: string;
  } | null>(null);
  const [ending, setEnding] = useState(false);

  const speechRef = useRef<SpeechManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech and load interview data
  useEffect(() => {
    speechRef.current = new SpeechManager();

    const loadInterview = async () => {
      const { data: interviewData } = await supabase
        .from('interviews')
        .select('interview_type, job_title, field')
        .eq('id', id)
        .single();

      if (interviewData) setInterview(interviewData);

      // Load existing messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('role, content')
        .eq('interview_id', id)
        .order('created_at', { ascending: true });

      if (msgs && msgs.length > 0) {
        // Filter out the hidden system kickoff message
        const visible = msgs.filter(
          (m) =>
            !(
              m.role === 'user' &&
              m.content.includes('The interview is starting now')
            )
        );
        setMessages(visible as ChatMessage[]);

        // Speak the last assistant message if it exists
        const lastAssistant = visible.filter((m) => m.role === 'assistant').pop();
        if (lastAssistant && speechRef.current?.isSupported) {
          setIsSpeaking(true);
          speechRef.current.speak(lastAssistant.content, () =>
            setIsSpeaking(false)
          );
        }
      }
    };

    loadInterview();

    return () => {
      speechRef.current?.cleanup();
    };
  }, [id, supabase]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: ChatMessage = { role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setInterimTranscript('');
      setIsStreaming(true);

      // Stop any ongoing speech
      speechRef.current?.stopSpeaking();

      try {
        const res = await fetch('/api/interview/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interview_id: id, message: text.trim() }),
        });

        if (!res.ok) throw new Error('Failed to send message');

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let assistantText = '';

        // Add empty assistant message
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: assistantText,
            };
            return updated;
          });
        }

        // Speak the response
        if (useVoice && speechRef.current?.isSupported) {
          setIsSpeaking(true);
          speechRef.current.speak(assistantText, () => setIsSpeaking(false));
        }
      } catch (error) {
        console.error('Chat error:', error);
      } finally {
        setIsStreaming(false);
      }
    },
    [id, isStreaming, useVoice]
  );

  const toggleListening = () => {
    if (!speechRef.current?.isSupported) return;

    if (isListening) {
      speechRef.current.stopListening();
      setIsListening(false);
      // Send the accumulated transcript
      if (interimTranscript.trim()) {
        sendMessage(interimTranscript);
      }
    } else {
      // Stop AI speaking when user starts talking
      speechRef.current.stopSpeaking();
      setIsSpeaking(false);
      setInterimTranscript('');

      speechRef.current.startListening({
        onResult: (transcript, isFinal) => {
          setInterimTranscript(transcript);
          if (isFinal) {
            // Don't auto-send on final - let user confirm by clicking stop
          }
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
      setIsListening(true);
    }
  };

  const handleEndInterview = async () => {
    setEnding(true);
    speechRef.current?.cleanup();

    const res = await fetch('/api/interview/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interview_id: id }),
    });

    if (res.ok) {
      router.push(`/review/${id}`);
    }
    setEnding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Header */}
      {interview && (
        <InterviewHeader
          interviewType={interview.interview_type}
          jobTitle={interview.job_title}
          messageCount={messages.length}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Avatar + Transcript */}
        <div className="flex-1 flex flex-col">
          {/* Avatar area */}
          <div className="p-6 flex justify-center bg-gradient-to-b from-gray-50 to-white">
            <InterviewerAvatar isSpeaking={isSpeaking} />
          </div>

          {/* Chat transcript */}
          <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {/* Interim speech transcript */}
            {isListening && interimTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-indigo-100 text-indigo-800 italic">
                  {interimTranscript}
                </div>
              </div>
            )}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              {useVoice ? (
                <>
                  <button
                    onClick={toggleListening}
                    disabled={isStreaming}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all',
                      isListening
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200 hover:bg-indigo-100'
                    )}
                  >
                    {isListening ? (
                      <>
                        <Square className="h-4 w-4" />
                        Stop & Send
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Hold to Speak
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setUseVoice(false)}
                    className="p-3 text-gray-400 hover:text-gray-600"
                    title="Switch to typing"
                  >
                    <Keyboard className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setUseVoice(true)}
                    className="p-3 text-gray-400 hover:text-gray-600"
                    title="Switch to voice"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isStreaming}
                  />
                  <Button
                    size="sm"
                    onClick={() => sendMessage(inputText)}
                    disabled={!inputText.trim() || isStreaming}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </>
              )}

              <Button
                variant="danger"
                size="sm"
                onClick={handleEndInterview}
                loading={ending}
                disabled={isStreaming}
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>

        {/* Right panel: Code editor or notes (for technical/system_design) */}
        {interview &&
          (interview.interview_type === 'technical' ||
            interview.interview_type === 'system_design') && (
            <div className="w-[45%] border-l border-gray-200 flex flex-col bg-white">
              <div className="h-10 bg-gray-50 border-b border-gray-200 px-4 flex items-center">
                <span className="text-xs font-medium text-gray-500">
                  {interview.interview_type === 'technical'
                    ? 'Code Editor'
                    : 'Whiteboard'}
                </span>
              </div>
              <div className="flex-1">
                {interview.interview_type === 'technical' ? (
                  <CodeEditor />
                ) : (
                  <Whiteboard />
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
