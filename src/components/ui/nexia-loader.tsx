import { cn } from '@/lib/utils';

interface NexiaLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NexiaLoader({ className, size = 'md' }: NexiaLoaderProps) {
  const sizes = {
    sm: 24,
    md: 40,
    lg: 64,
  };

  const textSizes = {
    sm: 'text-[6px]',
    md: 'text-[10px]',
    lg: 'text-[16px]',
  };

  const dimension = sizes[size];

  return (
    <div 
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: dimension, height: dimension }}
    >
      {/* Octagon SVG with animated stroke - perfect aspect ratio */}
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="nexiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        
        {/* Background octagon (subtle) */}
        <polygon
          points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
          fill="none"
          stroke="hsl(var(--primary) / 0.15)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        
        {/* Animated octagon stroke */}
        <polygon
          points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
          fill="none"
          stroke="url(#nexiaGradient)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="nexia-loader-stroke"
          style={{
            strokeDasharray: '340',
            strokeDashoffset: '340',
          }}
        />
      </svg>
      
      {/* NS Text in center */}
      <span 
        className={cn(
          'font-bold tracking-tight text-primary animate-pulse relative z-10',
          textSizes[size]
        )}
      >
        NS
      </span>

      <style>{`
        @keyframes nexia-stroke {
          0% {
            stroke-dashoffset: 340;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -340;
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
