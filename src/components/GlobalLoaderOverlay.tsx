import { useGlobalLoader } from '@/contexts/GlobalLoaderContext';

export function GlobalLoaderOverlay() {
  const { isVisible, loadingMessage } = useGlobalLoader();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
      style={{ pointerEvents: 'all' }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Nexia NS Logo with Pentagon Animation */}
        <div className="relative">
          {/* Pentagon container with animated border */}
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 100 100" 
            className="animate-spin-slow"
            style={{ animationDuration: '3s' }}
          >
            <defs>
              <linearGradient id="globalPentagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
            {/* Pentagon path */}
            <path
              d="M50 5 L93 38 L77 90 L23 90 L7 38 Z"
              fill="none"
              stroke="url(#globalPentagonGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pentagon-dash"
            />
          </svg>
          
          {/* NS Logo centered inside */}
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
        .pentagon-dash {
          stroke-dasharray: 300;
          stroke-dashoffset: 0;
          animation: dash-animation 2s ease-in-out infinite;
        }
        @keyframes dash-animation {
          0% { stroke-dashoffset: 300; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -300; }
        }
      `}</style>
    </div>
  );
}
