import { cn } from '@/lib/utils';

interface NexiaLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NexiaLoader({ className, size = 'md' }: NexiaLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-[6px]',
    md: 'text-[10px]',
    lg: 'text-[16px]',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      {/* Pentagon SVG with animated stroke */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <linearGradient id="nexiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        
        {/* Background pentagon (subtle) */}
        <polygon
          points="50,5 95,35 80,90 20,90 5,35"
          fill="none"
          stroke="hsl(var(--primary) / 0.15)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        
        {/* Animated pentagon stroke */}
        <polygon
          points="50,5 95,35 80,90 20,90 5,35"
          fill="none"
          stroke="url(#nexiaGradient)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="nexia-loader-stroke"
          style={{
            strokeDasharray: '300',
            strokeDashoffset: '300',
          }}
        />
      </svg>
      
      {/* NS Text in center */}
      <span 
        className={cn(
          'font-bold tracking-tight text-primary animate-pulse',
          textSizes[size]
        )}
        style={{ transform: 'translateY(1px)' }}
      >
        NS
      </span>

      <style>{`
        @keyframes nexia-stroke {
          0% {
            stroke-dashoffset: 300;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -300;
          }
        }
        
        .nexia-loader-stroke {
          animation: nexia-stroke 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Inline loader for buttons and small spaces
export function NexiaLoaderInline({ className }: { className?: string }) {
  return <NexiaLoader size="sm" className={className} />;
}
