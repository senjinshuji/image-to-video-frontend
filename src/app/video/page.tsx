'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api, fetcher, VideoJob } from '@/lib/api';
import { VideoPreviewPanel } from '@/components/VideoPreviewPanel';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

function VideoGenerationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialImageUrl = searchParams.get('image');
  const rowId = searchParams.get('row');

  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [motionText, setMotionText] = useState('');
  const [veoJobId, setVeoJobId] = useState<string | null>(null);
  const [klingJobId, setKlingJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; model: 'veo' | 'kling' } | null>(null);

  // Poll job statuses
  const { data: veoJob } = useSWR<VideoJob>(
    veoJobId ? `/video-jobs/${veoJobId}` : null,
    fetcher,
    {
      refreshInterval: veoJobId ? 3000 : 0,
    }
  );

  const { data: klingJob } = useSWR<VideoJob>(
    klingJobId ? `/video-jobs/${klingJobId}` : null,
    fetcher,
    {
      refreshInterval: klingJobId ? 3000 : 0,
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

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlSubmit = () => {
    if (imageInputUrl) {
      setImageUrl(imageInputUrl);
      setUploadedImage(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Video Generation</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Source Image */}
            <div>
              <h3 className="text-sm font-medium mb-2">Source Image</h3>
              {imageUrl ? (
                <div className="space-y-2">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt="Source image"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setImageUrl('');
                      setUploadedImage(null);
                      setImageInputUrl('');
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload Image */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer block"
                    >
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 text-gray-400">
                          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">Upload an image</p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Or divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or</span>
                    </div>
                  </div>
                  
                  {/* Image URL */}
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={imageInputUrl}
                      onChange={(e) => setImageInputUrl(e.target.value)}
                      placeholder="Paste image URL"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleImageUrlSubmit}
                      disabled={!imageInputUrl}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Use This URL
                    </button>
                  </div>
                  
                  {/* Generate Image Link */}
                  <div className="text-center">
                    <button
                      onClick={() => router.push('/image')}
                      className="text-sm text-primary hover:underline"
                    >
                      Or generate a new image →
                    </button>
                  </div>
                </div>
              )}
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

export default function VideoGenerationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="space-y-6">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <VideoGenerationContent />
    </Suspense>
  );
}