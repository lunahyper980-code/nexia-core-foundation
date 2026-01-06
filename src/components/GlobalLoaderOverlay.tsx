import { useGlobalLoader } from '@/contexts/GlobalLoaderContext';

export function GlobalLoaderOverlay() {
  const { isVisible, loadingMessage } = useGlobalLoader();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
      style={{ pointerEvents: 'all' }}
      role="status"
      aria-label="Carregando"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Nexia NS Logo with Octagon Animation */}
        <div className="relative" style={{ width: 80, height: 80 }}>
          {/* Octagon container with animated border */}
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 animate-spin-slow"
            style={{ animationDuration: '3s' }}
          >
            <defs>
              <linearGradient id="globalOctagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
            {/* Octagon path - 8 sides, perfect proportions */}
            <polygon
              points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
              fill="none"
              stroke="url(#globalOctagonGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="octagon-dash"
            />
          </svg>
          
          {/* NS Logo centered inside - does not rotate */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-2xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent animate-pulse"
              style={{ animationDuration: '1.5s' }}
            >
              NS
            </span>
          </div>
        </div>

        {/* Optional loading message */}
        {loadingMessage && (
          <p className="text-sm text-muted-foreground animate-pulse max-w-xs text-center">
            {loadingMessage}
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .octagon-dash {
          stroke-dasharray: 340;
          stroke-dashoffset: 0;
          animation: dash-animation 2s ease-in-out infinite;
        }
        @keyframes dash-animation {
          0% { stroke-dashoffset: 340; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -340; }
        }
      `}</style>
    </div>
  );
}
