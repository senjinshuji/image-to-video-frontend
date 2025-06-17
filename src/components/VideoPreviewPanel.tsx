'use client';

import { VideoJob } from '@/lib/api';
import { CheckCircle, XCircle, Loader2, Play, Download } from 'lucide-react';
import { useRef, useState } from 'react';

interface VideoPreviewPanelProps {
  veoJob?: VideoJob;
  klingJob?: VideoJob;
  onSelectVideo?: (videoUrl: string, model: 'veo' | 'kling') => void;
}

export function VideoPreviewPanel({ veoJob, klingJob, onSelectVideo }: VideoPreviewPanelProps) {
  const veoVideoRef = useRef<HTMLVideoElement>(null);
  const klingVideoRef = useRef<HTMLVideoElement>(null);
  const [veoPlaying, setVeoPlaying] = useState(false);
  const [klingPlaying, setKlingPlaying] = useState(false);

  const renderJobStatus = (job?: VideoJob, model?: 'veo' | 'kling') => {
    if (!job) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">No job started</p>
        </div>
      );
    }

    switch (job.status) {
      case 'pending':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
            <p className="text-sm text-gray-500">Waiting to start...</p>
          </div>
        );
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Generating video...</p>
            <p className="text-xs text-gray-400 mt-1">This may take 1-5 minutes</p>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <XCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-sm text-red-600">Generation failed</p>
            {job.error_message && (
              <p className="text-xs text-gray-500 mt-2 text-center">{job.error_message}</p>
            )}
          </div>
        );
      case 'completed':
        return job.video_url ? (
          <div className="relative h-full group">
            <video
              ref={model === 'veo' ? veoVideoRef : klingVideoRef}
              src={job.video_url}
              className="w-full h-full object-cover"
              controls={false}
              loop
              muted
              playsInline
              onPlay={() => model === 'veo' ? setVeoPlaying(true) : setKlingPlaying(true)}
              onPause={() => model === 'veo' ? setVeoPlaying(false) : setKlingPlaying(false)}
            />
            
            {/* Play/Pause Overlay */}
            <button
              onClick={() => {
                const video = model === 'veo' ? veoVideoRef.current : klingVideoRef.current;
                const isPlaying = model === 'veo' ? veoPlaying : klingPlaying;
                
                if (video) {
                  if (isPlaying) {
                    video.pause();
                  } else {
                    video.play();
                  }
                }
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="bg-white/90 rounded-full p-3">
                <Play className={`w-6 h-6 ${(model === 'veo' ? veoPlaying : klingPlaying) ? 'hidden' : ''}`} />
                <div className={`w-6 h-6 ${(model === 'veo' ? veoPlaying : klingPlaying) ? '' : 'hidden'}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Download Button */}
            <a
              href={job.video_url}
              download={`${model}-video-${job.id}.mp4`}
              className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Select Button */}
            {onSelectVideo && (
              <button
                onClick={() => onSelectVideo(job.video_url!, model!)}
                className="absolute bottom-2 left-2 right-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium"
              >
                Select This Video
              </button>
            )}
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Veo Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Veo</h3>
          {veoJob?.status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {renderJobStatus(veoJob, 'veo')}
        </div>
        {veoJob && (
          <div className="text-sm text-gray-500">
            <p>Motion: {veoJob.motion_prompt}</p>
            <p>Created: {new Date(veoJob.created_at).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Kling Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Kling</h3>
          {klingJob?.status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {renderJobStatus(klingJob, 'kling')}
        </div>
        {klingJob && (
          <div className="text-sm text-gray-500">
            <p>Motion: {klingJob.motion_prompt}</p>
            <p>Created: {new Date(klingJob.created_at).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}