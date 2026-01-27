import { useEffect, useRef, useState } from 'react';

interface NeuralAnimationProps {
  open: boolean;
  message?: string;
}

const PROGRESS_STEPS = [
  { label: 'Buscando empresas na região...', duration: 500 },
  { label: 'Analisando oportunidades de mercado...', duration: 600 },
  { label: 'Identificando negócios similares...', duration: 500 },
  { label: 'Expandindo alcance da busca...', duration: 600 },
  { label: 'Organizando 15-20 leads...', duration: 400 },
];

export function NeuralAnimation({ open, message }: NeuralAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  // Handle visibility with fade transition
  useEffect(() => {
    if (open) {
      setVisible(true);
      setCurrentStep(0);
    }
  }, [open]);

  // Progress steps animation
  useEffect(() => {
    if (!open) return;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PROGRESS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(stepInterval);
  }, [open]);

  // Canvas spinning globe animation
  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const globeRadius = 100;

    // Points on globe surface
    interface GlobePoint {
      lat: number;
      lng: number;
      size: number;
    }

    const points: GlobePoint[] = [];
    
    // Create points distributed on globe
    for (let i = 0; i < 120; i++) {
      points.push({
        lat: (Math.random() - 0.5) * Math.PI,
        lng: Math.random() * Math.PI * 2,
        size: Math.random() * 2 + 1,
      });
    }

    // Latitude lines
    const latLines = [-60, -30, 0, 30, 60].map(deg => deg * Math.PI / 180);
    
    let animationId: number;
    let time = 0;
    let rotation = 0;

    const animate = () => {
      time += 0.016;
      rotation += 0.008; // Globe rotation speed

      // Clear with fade effect
      ctx.fillStyle = 'rgba(10, 10, 25, 0.15)';
      ctx.fillRect(0, 0, size, size);

      // Draw outer glow rings
      const brainPulse = Math.sin(time * 2) * 0.3 + 0.7;

      for (let ring = 3; ring >= 0; ring--) {
        const ringRadius = globeRadius + 15 + ring * 20 + Math.sin(time * 1.5 + ring) * 5;
        const ringAlpha = 0.04 + (3 - ring) * 0.02;

        const ringGradient = ctx.createRadialGradient(
          centerX, centerY, ringRadius * 0.5,
          centerX, centerY, ringRadius
        );
        ringGradient.addColorStop(0, `rgba(139, 92, 246, ${ringAlpha * brainPulse})`);
        ringGradient.addColorStop(0.5, `rgba(99, 102, 241, ${ringAlpha * brainPulse * 0.5})`);
        ringGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.fillStyle = ringGradient;
        ctx.fill();
      }

      // Draw globe base with gradient
      const globeGradient = ctx.createRadialGradient(
        centerX - 30, centerY - 30, 0,
        centerX, centerY, globeRadius
      );
      globeGradient.addColorStop(0, 'rgba(30, 20, 50, 0.9)');
      globeGradient.addColorStop(0.7, 'rgba(15, 10, 35, 0.95)');
      globeGradient.addColorStop(1, 'rgba(10, 5, 25, 1)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.fillStyle = globeGradient;
      ctx.fill();

      // Draw latitude lines (ellipses)
      latLines.forEach(lat => {
        const y = centerY + Math.sin(lat) * globeRadius;
        const radiusX = Math.cos(lat) * globeRadius;
        
        if (radiusX > 0) {
          ctx.beginPath();
          ctx.ellipse(centerX, y, radiusX, radiusX * 0.2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw longitude lines (rotating)
      for (let i = 0; i < 8; i++) {
        const lng = (i / 8) * Math.PI * 2 + rotation;
        
        ctx.beginPath();
        for (let t = -Math.PI / 2; t <= Math.PI / 2; t += 0.1) {
          const x = centerX + Math.cos(lng) * Math.cos(t) * globeRadius;
          const y = centerY + Math.sin(t) * globeRadius;
          const z = Math.sin(lng) * Math.cos(t);
          
          // Only draw if facing front
          if (z > -0.3) {
            if (t === -Math.PI / 2) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + Math.cos(lng + rotation) * 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw points on globe
      points.forEach((point) => {
        const rotatedLng = point.lng + rotation;
        
        // 3D to 2D projection
        const x = centerX + Math.cos(rotatedLng) * Math.cos(point.lat) * globeRadius;
        const y = centerY + Math.sin(point.lat) * globeRadius;
        const z = Math.sin(rotatedLng) * Math.cos(point.lat);

        // Only draw if point is on visible side
        if (z > -0.2) {
          const brightness = (z + 1) / 2;
          const pulse = Math.sin(time * 3 + point.lat * 5 + point.lng * 3) * 0.3 + 0.7;

          // Glow effect
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, point.size * 5);
          glowGradient.addColorStop(0, `rgba(168, 85, 247, ${0.6 * brightness * pulse})`);
          glowGradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.2 * brightness * pulse})`);
          glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

          ctx.beginPath();
          ctx.arc(x, y, point.size * 5, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();

          // Core point
          ctx.beginPath();
          ctx.arc(x, y, point.size * brightness, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * brightness + 0.3})`;
          ctx.fill();
        }
      });

      // Draw connection lines between nearby visible points
      points.forEach((point, i) => {
        const rotatedLng1 = point.lng + rotation;
        const x1 = centerX + Math.cos(rotatedLng1) * Math.cos(point.lat) * globeRadius;
        const y1 = centerY + Math.sin(point.lat) * globeRadius;
        const z1 = Math.sin(rotatedLng1) * Math.cos(point.lat);

        if (z1 > 0.1) {
          points.slice(i + 1, i + 8).forEach((other) => {
            const rotatedLng2 = other.lng + rotation;
            const x2 = centerX + Math.cos(rotatedLng2) * Math.cos(other.lat) * globeRadius;
            const y2 = centerY + Math.sin(other.lat) * globeRadius;
            const z2 = Math.sin(rotatedLng2) * Math.cos(other.lat);

            const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

            if (z2 > 0.1 && dist < 60 && dist > 10) {
              const alpha = (1 - dist / 60) * 0.4;
              const flowOffset = (time * 2 + i * 0.3) % 1;

              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);

              const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2);
              lineGradient.addColorStop(0, `rgba(99, 102, 241, ${alpha * 0.3})`);
              lineGradient.addColorStop(flowOffset, `rgba(168, 85, 247, ${alpha})`);
              lineGradient.addColorStop(Math.min(flowOffset + 0.2, 1), `rgba(99, 102, 241, ${alpha * 0.3})`);

              ctx.strokeStyle = lineGradient;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });
        }
      });

      // Inner glow at center
      const innerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, globeRadius * 0.5);
      innerGlow.addColorStop(0, `rgba(139, 92, 246, ${0.15 * brainPulse})`);
      innerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Highlight edge glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 * brainPulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      animationId = requestAnimationFrame(animate);
    };

    // Initial background
    ctx.fillStyle = 'rgba(10, 10, 25, 1)';
    ctx.fillRect(0, 0, size, size);

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [visible]);

  // Handle fade out when closing
  useEffect(() => {
    if (!open && visible) {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open, visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 30, 0.98) 0%, rgba(30, 15, 50, 0.98) 50%, rgba(10, 10, 30, 0.98) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto animate-fade-in">
        {/* Canvas container with glow effects */}
        <div className="relative mb-8">
          {/* Outer glow ring */}
          <div className="absolute inset-0 -m-8 bg-gradient-to-r from-indigo-500/20 via-purple-500/30 to-indigo-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute inset-0 -m-4 bg-gradient-to-r from-purple-600/20 via-violet-500/25 to-purple-600/20 rounded-full blur-xl" 
            style={{ animation: 'pulse 2s ease-in-out infinite alternate' }} 
          />

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="relative rounded-full"
            style={{
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.4), 0 0 100px rgba(99, 102, 241, 0.2), inset 0 0 30px rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          />
        </div>

        {/* Text content */}
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {message || 'Encontrando oportunidades na sua região...'}
          </h2>
          <p className="text-purple-200/70 text-sm sm:text-base max-w-xs mx-auto">
            Analisando o mercado local e organizando possíveis clientes.
          </p>
        </div>

        {/* Progress steps */}
        <div className="w-full max-w-xs space-y-3">
          {PROGRESS_STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 transition-all duration-500 ${
                index <= currentStep ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : index === currentStep
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse'
                    : 'bg-gray-700'
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-white' : 'bg-gray-500'}`} />
                )}
              </div>
              <span className={`text-sm ${index <= currentStep ? 'text-white' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Animated progress bar */}
        <div className="w-full max-w-xs mt-6">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
              style={{
                width: `${((currentStep + 1) / PROGRESS_STEPS.length) * 100}%`,
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Floating dots indicator */}
        <div className="flex items-center gap-2 mt-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
              style={{
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
}
