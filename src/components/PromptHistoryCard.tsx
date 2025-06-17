'use client';

import { useState } from 'react';
import { ImageJob } from '@/lib/api';
import { Clock, CheckCircle, XCircle, Loader2, Copy, Download, Video } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PromptHistoryCardProps {
  job: ImageJob;
  onUsePrompt?: (prompt: string) => void;
  isActive?: boolean;
}

export function PromptHistoryCard({ job, onUsePrompt, isActive = false }: PromptHistoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(job.prompt);
    // TODO: Show toast notification
  };

  const handleDownloadImage = () => {
    if (job.image_url) {
      const link = document.createElement('a');
      link.href = job.image_url;
      link.download = `generated-${job.id}.png`;
      link.click();
    }
  };

  return (
    <div className={`border rounded-lg p-4 space-y-3 ${isActive ? 'ring-2 ring-primary' : ''}`}>
      {/* Status and Time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize">{job.status}</span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(job.created_at).toLocaleString()}
        </span>
      </div>

      {/* Image Preview */}
      {job.status === 'completed' && job.image_url && !imageError && (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={job.image_url}
            alt="Generated image"
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <button
            onClick={handleDownloadImage}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-lg hover:bg-white transition-colors"
            title="Download image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {job.status === 'failed' && job.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{job.error}</p>
        </div>
      )}

      {/* Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Prompt:</span>
          <button
            onClick={handleCopyPrompt}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy prompt"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3">{job.prompt}</p>
      </div>

      {/* Action Buttons */}
      {job.status === 'completed' && (
        <div className="flex gap-2">
          {onUsePrompt && (
            <button
              onClick={() => onUsePrompt(job.prompt)}
              className="flex-1 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              Use this prompt
            </button>
          )}
          {job.image_url && (
            <button
              onClick={() => router.push(`/video?image=${encodeURIComponent(job.image_url!)}`)}
              className="flex-1 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              Generate Video
            </button>
          )}
        </div>
      )}
    </div>
  );
}