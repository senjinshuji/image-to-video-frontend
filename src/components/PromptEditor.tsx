'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Wand2, RotateCcw } from 'lucide-react';

interface PromptEditorProps {
  initialPrompt?: string;
  onGenerate: (prompt: string) => void;
  onRegenerate?: (prompt: string) => void;
  isLoading?: boolean;
  hasImage?: boolean;
}

export function PromptEditor({
  initialPrompt = '',
  onGenerate,
  onRegenerate,
  isLoading = false,
  hasImage = false,
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (hasImage && onRegenerate) {
        onRegenerate(prompt);
      } else {
        onGenerate(prompt);
      }
    }
  };

  const handleSubmit = () => {
    if (hasImage && onRegenerate) {
      onRegenerate(prompt);
    } else {
      onGenerate(prompt);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to generate..."
          className="w-full min-h-[120px] p-4 pr-12 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <div className="absolute top-4 right-4 text-xs text-gray-400">
          {prompt.length} chars
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Cmd/Ctrl + Enter</kbd> to generate
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : hasImage && onRegenerate ? (
            <>
              <RotateCcw className="w-4 h-4" />
              Regenerate
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
}