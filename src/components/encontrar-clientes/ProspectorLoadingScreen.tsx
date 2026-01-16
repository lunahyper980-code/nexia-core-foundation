import { useEffect, useState } from 'react';
import { PremiumGlobeCanvas } from './PremiumGlobeCanvas';

const ROTATING_MESSAGES = [
  'Cruzando dados públicos e sinais online…',
  'Avaliando presença digital dos negócios…',
  'Classificando empresas prontas para conversão…',
  'Identificando oportunidades na sua região…',
  'Analisando padrões de mercado local…',
];

interface ProspectorLoadingScreenProps {
  open: boolean;
}

export function ProspectorLoadingScreen({ open }: ProspectorLoadingScreenProps) {
  const [visible, setVisible] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Handle visibility
  useEffect(() => {
    if (open) {
      setVisible(true);
      setCurrentMessageIndex(0);
    }
  }, [open]);

  // Rotate messages
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [open]);

  // Handle fade out
  useEffect(() => {
    if (!open && visible) {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open, visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, rgba(20, 10, 40, 0.98) 0%, rgba(5, 5, 15, 0.99) 100%)',
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Globe */}
      <div className="relative mb-12">
        <div className="absolute inset-[-40px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <PremiumGlobeCanvas size={280} />
      </div>

      {/* Status Text - Below the globe with proper spacing */}
      <div className="text-center space-y-4 mb-8 px-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-wider uppercase">
          Analisando o Mercado da Sua Região
        </h2>
        <p 
          className="text-primary/80 text-sm md:text-base max-w-sm mx-auto transition-opacity duration-500"
          key={currentMessageIndex}
          style={{ animation: 'fadeInUp 0.5s ease-out' }}
        >
          {ROTATING_MESSAGES[currentMessageIndex]}
        </p>
      </div>

      {/* Progress Bar - Purple with glow */}
      <div className="w-full max-w-xs px-6">
        <div className="h-1.5 bg-background/30 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(280 80% 60%), hsl(var(--primary)))',
              backgroundSize: '200% 100%',
              animation: 'shimmerProgress 2s linear infinite, progressWidth 3s ease-in-out infinite',
              boxShadow: '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)',
            }}
          />
        </div>
      </div>

      {/* Floating dots */}
      <div className="flex items-center gap-2 mt-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary"
            style={{
              animation: 'dotBounce 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-25px) translateX(15px);
            opacity: 0.5;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmerProgress {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        @keyframes progressWidth {
          0%, 100% {
            width: 20%;
          }
          50% {
            width: 80%;
          }
        }
        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1.3);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
