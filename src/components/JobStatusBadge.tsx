import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface JobStatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function JobStatusBadge({ 
  status, 
  size = 'md', 
  showText = true,
  className 
}: JobStatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      text: 'Pending',
      className: 'bg-gray-100 text-gray-700',
      iconClassName: '',
    },
    processing: {
      icon: Loader2,
      text: 'Processing',
      className: 'bg-blue-100 text-blue-700',
      iconClassName: 'animate-spin',
    },
    completed: {
      icon: CheckCircle,
      text: 'Completed',
      className: 'bg-green-100 text-green-700',
      iconClassName: '',
    },
    failed: {
      icon: XCircle,
      text: 'Failed',
      className: 'bg-red-100 text-red-700',
      iconClassName: '',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <Icon className={cn(iconSizes[size], config.iconClassName)} />
      {showText && <span>{config.text}</span>}
    </div>
  );
}