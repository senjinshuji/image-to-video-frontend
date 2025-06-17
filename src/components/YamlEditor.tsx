'use client';

import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Sparkles, X } from 'lucide-react';
import Image from 'next/image';

interface YamlEditorProps {
  initialYaml: string;
  referenceImage?: string;
  onGenerate: (yaml: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function YamlEditor({ 
  initialYaml, 
  referenceImage, 
  onGenerate, 
  onCancel,
  isLoading = false
}: YamlEditorProps) {
  const [yaml, setYaml] = useState(initialYaml);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 簡易的なYAML検証
  useEffect(() => {
    try {
      // 基本的な構造チェック
      const requiredSections = ['scene:', 'subjects:', 'environment:', 'visual_style:', 'technical:'];
      const missingSection = requiredSections.find(section => !yaml.includes(section));
      
      if (missingSection) {
        setIsValid(false);
        setError(`Missing required section: ${missingSection}`);
      } else {
        setIsValid(true);
        setError(null);
      }
    } catch {
      setIsValid(false);
      setError('Invalid YAML format');
    }
  }, [yaml]);

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml);
    // TODO: Show toast notification
  };

  const handleReset = () => {
    setYaml(initialYaml);
  };

  const handleGenerate = () => {
    if (isValid) {
      onGenerate(yaml);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Image Analysis Result</h3>
            <p className="text-sm text-gray-500">
              Edit the YAML description below to customize your image generation
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Reference Image */}
          {referenceImage && (
            <div className="w-1/3 border-r p-4 overflow-y-auto">
              <h4 className="text-sm font-medium mb-3">Reference Image</h4>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={referenceImage}
                  alt="Reference"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>✓ Image analyzed successfully</p>
                <p>✓ YAML structure generated</p>
                <p>✓ Ready for customization</p>
              </div>
            </div>
          )}

          {/* YAML Editor */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">YAML Description</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy YAML"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Reset to original"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="relative">
                <textarea
                  value={yaml}
                  onChange={(e) => setYaml(e.target.value)}
                  className={`w-full h-[400px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                    isValid 
                      ? 'border-gray-300 focus:ring-primary' 
                      : 'border-red-300 focus:ring-red-500'
                  }`}
                  spellCheck={false}
                  disabled={isLoading}
                />
                {!isValid && error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Tips:</strong> Modify the YAML to change image characteristics. 
                  Be specific with descriptions, moods, and visual styles for best results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!isValid || isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate with this YAML
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}