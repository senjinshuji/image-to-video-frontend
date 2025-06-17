'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api, fetcher, VideoJob } from '@/lib/api';
import { VideoPreviewPanel } from '@/components/VideoPreviewPanel';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function VideoGenerationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const imageUrl = searchParams.get('image');
  const rowId = searchParams.get('row');

  const [motionText, setMotionText] = useState('');
  const [veoJobId, setVeoJobId] = useState<string | null>(null);
  const [klingJobId, setKlingJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; model: 'veo' | 'kling' } | null>(null);

  // Poll job statuses
  const { data: veoJob } = useSWR(
    veoJobId ? `/video-jobs/${veoJobId}` : null,
    fetcher,
    {
      refreshInterval: veoJobId && (!veoJob || veoJob.status === 'processing') ? 3000 : 0,
    }
  );

  const { data: klingJob } = useSWR(
    klingJobId ? `/video-jobs/${klingJobId}` : null,
    fetcher,
    {
      refreshInterval: klingJobId && (!klingJob || klingJob.status === 'processing') ? 3000 : 0,
    }
  );

  const handleGenerate = async () => {
    if (!imageUrl || !motionText.trim()) return;

    try {
      setIsGenerating(true);
      
      // Create both jobs in parallel
      const [veoResult, klingResult] = await Promise.allSettled([
        api.createVideoJob(imageUrl, motionText, 'veo'),
        api.createVideoJob(imageUrl, motionText, 'kling')
      ]);

      if (veoResult.status === 'fulfilled') {
        setVeoJobId(veoResult.value.id);
      }
      if (klingResult.status === 'fulfilled') {
        setKlingJobId(klingResult.value.id);
      }
    } catch (error) {
      console.error('Failed to generate videos:', error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedToFinalize = () => {
    if (selectedVideo) {
      router.push(`/finalize?video=${encodeURIComponent(selectedVideo.url)}&model=${selectedVideo.model}&row=${rowId || ''}`);
    }
  };

  const hasCompletedVideos = 
    (veoJob?.status === 'completed' && veoJob.video_url) ||
    (klingJob?.status === 'completed' && klingJob.video_url);

  if (!imageUrl) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Image Selected</h2>
          <p className="text-gray-600 mb-6">Please generate an image first before creating videos.</p>
          <button
            onClick={() => router.push('/image')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Image Generation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Video Generation</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Source Image Preview */}
            <div>
              <h3 className="text-sm font-medium mb-2">Source Image</h3>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={imageUrl}
                  alt="Source image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

            {/* Motion Text Input */}
            <div className="space-y-2">
              <label htmlFor="motion" className="text-sm font-medium">
                Motion Description
              </label>
              <textarea
                id="motion"
                value={motionText}
                onChange={(e) => setMotionText(e.target.value)}
                placeholder="Describe how the image should move... (e.g., 'Camera slowly pans from left to right')"
                className="w-full min-h-[100px] p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isGenerating}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !motionText.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Videos
                </>
              )}
            </button>

            {/* Proceed Button */}
            {selectedVideo && (
              <button
                onClick={handleProceedToFinalize}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Proceed to Finalize
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Columns - Video Previews */}
          <div className="lg:col-span-2">
            <VideoPreviewPanel
              veoJob={veoJob}
              klingJob={klingJob}
              onSelectVideo={(url, model) => setSelectedVideo({ url, model })}
            />

            {/* Instructions */}
            {!veoJobId && !klingJobId && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Enter a motion description and click "Generate Videos" to create videos using both Veo and Kling models.
                  You'll be able to compare and select the best result.
                </p>
              </div>
            )}

            {/* Selection Status */}
            {hasCompletedVideos && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {selectedVideo 
                    ? `You've selected the ${selectedVideo.model.toUpperCase()} video. Click "Proceed to Finalize" to continue.`
                    : 'Click "Select This Video" on your preferred video to continue.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}