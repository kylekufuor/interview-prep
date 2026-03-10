'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
];

interface CodeEditorProps {
  onChange?: (value: string) => void;
}

export default function CodeEditor({ onChange }: CodeEditorProps) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your solution here\n');

  const handleChange = (value: string | undefined) => {
    const newValue = value || '';
    setCode(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Language selector toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-b border-[#333]">
        <span className="text-xs text-gray-400">Language:</span>
        <div className="flex gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={cn(
                'px-2 py-0.5 rounded text-xs transition-colors',
                language === lang.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#333]'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12 },
            suggest: { showKeywords: true },
          }}
        />
      </div>
    </div>
  );
}
