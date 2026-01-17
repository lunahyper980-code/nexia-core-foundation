interface SearchLoadingOverlayProps {
  open: boolean;
}

export function SearchLoadingOverlay({ open }: SearchLoadingOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center pb-32 sm:pb-40">
      {/* Simple overlay content - text and progress bar only */}
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        {/* Status text with subtle pulse */}
        <p 
          className="text-foreground/90 text-base sm:text-lg font-medium tracking-wide text-center animate-pulse"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          Encontrando oportunidades na sua região…
        </p>
        
        {/* Minimal indeterminate progress bar */}
        <div className="w-64 sm:w-80 h-1 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-primary/70 via-primary to-primary/70 rounded-full"
            style={{
              animation: 'indeterminate-progress 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes indeterminate-progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 60%;
            margin-left: 20%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}