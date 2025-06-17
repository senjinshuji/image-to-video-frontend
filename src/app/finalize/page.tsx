'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Save, CheckCircle, Play, Download } from 'lucide-react';

function FinalizeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('video');
  const model = searchParams.get('model');
  const rowId = searchParams.get('row');

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!videoUrl) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Video Selected</h2>
          <p className="text-gray-600 mb-6">Please select a video from the generation page first.</p>
          <button
            onClick={() => router.push('/video')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Video Generation
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!rowId) {
      console.error('No row ID provided');
      return;
    }

    try {
      setIsSaving(true);
      await api.finalize(rowId, videoUrl);
      setSaved(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Failed to save video:', error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Finalize Video</h2>

        {saved ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Video Saved Successfully!</h3>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full max-h-[600px] mx-auto"
                controls={false}
                loop
                muted
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Play/Pause Overlay */}
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
              >
                <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors">
                  {isPlaying ? (
                    <div className="w-8 h-8">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    </div>
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </div>
              </button>
            </div>

            {/* Video Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Selected Video</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Model:</span> {model?.toUpperCase()}</p>
                <p><span className="text-gray-500">Row ID:</span> {rowId || 'No row selected'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving || !rowId}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save & Complete
                  </>
                )}
              </button>

              <a
                href={videoUrl}
                download={`final-video-${model}.mp4`}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>

            {!rowId && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No row ID was provided. The video cannot be saved to Google Sheets. 
                  You can still download it using the button above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FinalizePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
            <div className="flex gap-4">
              <div className="h-12 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <FinalizeContent />
    </Suspense>
  );
}