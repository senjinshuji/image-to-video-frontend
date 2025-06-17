'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api, fetcher, ImageJob } from '@/lib/api';
import { PromptEditor } from '@/components/PromptEditor';
import { PromptHistoryCard } from '@/components/PromptHistoryCard';
import { ArrowRight, Upload, Link } from 'lucide-react';

export default function ImageGenerationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rowId = searchParams.get('row');
  
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');

  // Poll current job status
  const { data: currentJob } = useSWR(
    currentJobId ? `/image-jobs/${currentJobId}` : null,
    fetcher,
    {
      refreshInterval: currentJobId && jobs.find(j => j.id === currentJobId)?.status === 'processing' ? 2000 : 0,
    }
  );

  // Update jobs list when current job updates
  useEffect(() => {
    if (currentJob) {
      setJobs(prev => {
        const index = prev.findIndex(j => j.id === currentJob.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = currentJob;
          return updated;
        }
        return [currentJob, ...prev];
      });
    }
  }, [currentJob]);

  const handleGenerate = async (prompt: string) => {
    try {
      setIsGenerating(true);
      const job = await api.createImageJob(
        prompt,
        inputMode === 'image' ? referenceImageUrl : undefined
      );
      setCurrentJobId(job.id);
      setJobs(prev => [job, ...prev]);
    } catch (error) {
      console.error('Failed to generate image:', error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (prompt: string) => {
    if (!currentJobId) return;
    
    try {
      setIsGenerating(true);
      const job = await api.rebuildImageJob(currentJobId, prompt);
      setCurrentJobId(job.id);
      setJobs(prev => [job, ...prev]);
    } catch (error) {
      console.error('Failed to regenerate image:', error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedToVideo = () => {
    if (currentJob?.status === 'completed' && currentJob.image_url) {
      router.push(`/video?image=${encodeURIComponent(currentJob.image_url)}&row=${rowId || ''}`);
    }
  };

  const currentPrompt = jobs.find(j => j.id === currentJobId)?.prompt || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Image Generation</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Input Mode Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setInputMode('text')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  inputMode === 'text'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-sm font-medium">Text Prompt</span>
              </button>
              <button
                onClick={() => setInputMode('image')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  inputMode === 'image'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Reference Image</span>
              </button>
            </div>

            {/* Reference Image URL Input */}
            {inputMode === 'image' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Reference Image URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      value={referenceImageUrl}
                      onChange={(e) => setReferenceImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Editor */}
            <PromptEditor
              initialPrompt={currentPrompt}
              onGenerate={handleGenerate}
              onRegenerate={handleRegenerate}
              isLoading={isGenerating}
              hasImage={jobs.length > 0}
            />

            {/* Proceed to Video Button */}
            {currentJob?.status === 'completed' && currentJob.image_url && (
              <button
                onClick={handleProceedToVideo}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Proceed to Video Generation
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Column - History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generation History</h3>
            
            {jobs.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No images generated yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Your generated images will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {jobs.map((job) => (
                  <PromptHistoryCard
                    key={job.id}
                    job={job}
                    isActive={job.id === currentJobId}
                    onUsePrompt={(prompt) => {
                      setCurrentJobId(job.id);
                      // Prompt will be set by the editor
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}