import { useEffect, useRef, useState } from 'react';

interface PremiumGlobeProps {
  isSearching?: boolean;
}

const ROTATING_MESSAGES = [
  'Cruzando dados públicos e sinais online…',
  'Avaliando presença digital dos negócios…',
  'Classificando empresas prontas para conversão…',
  'Identificando oportunidades no mercado…',
  'Analisando padrões de comportamento…',
];

export function PremiumGlobe({ isSearching = false }: PremiumGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageOpacity, setMessageOpacity] = useState(1);

  // Rotate messages
  useEffect(() => {
    if (!isSearching) return;

    const interval = setInterval(() => {
      setMessageOpacity(0);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
        setMessageOpacity(1);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [isSearching]);

  // Canvas globe animation - based on the provided code
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    
    const resize = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 400;
      const containerHeight = canvas.parentElement?.clientHeight || 400;
      const size = Math.min(containerWidth, containerHeight, 500);
      
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
      
      return size;
    };

    let size = resize();
    let w = size;
    let h = size;
    let r = Math.min(w, h) * 0.38;

    window.addEventListener('resize', () => {
      size = resize();
      w = size;
      h = size;
      r = Math.min(w, h) * 0.38;
    });

    // Point class for globe points
    interface Point {
      theta: number;
      phi: number;
      lead: boolean;
      size: number;
      color: string;
      glowColor: string;
    }

    const points: Point[] = [];
    let rot = 0;

    // Create points on the sphere
    for (let i = 0; i < 600; i++) {
      const lead = Math.random() > 0.88;
      points.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(Math.random() * 2 - 1),
        lead,
        size: lead ? 3.5 : 1.2,
        color: lead ? '#22c55e' : '#a855f7',
        glowColor: lead ? 'rgba(34, 197, 94, 0.6)' : 'rgba(168, 85, 247, 0.4)',
      });
    }

    // Grid lines for latitude
    const latLines: number[] = [];
    for (let i = 1; i < 8; i++) {
      latLines.push((i / 8) * Math.PI);
    }

    // Grid lines for longitude
    const numLongitudes = 16;

    let animationId: number;

    const project = (theta: number, phi: number, rotation: number) => {
      const x = r * Math.sin(phi) * Math.cos(theta + rotation);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta + rotation) + r;

      const scale = (r * 2) / (r * 2 + z);
      return {
        x: x * scale + w / 2,
        y: y * scale + h / 2,
        z: z,
        a: scale,
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      rot += 0.003;

      // Draw subtle outer glow
      const outerGlow = ctx.createRadialGradient(w / 2, h / 2, r * 0.5, w / 2, h / 2, r * 1.4);
      outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0)');
      outerGlow.addColorStop(0.6, 'rgba(139, 92, 246, 0.03)');
      outerGlow.addColorStop(0.8, 'rgba(139, 92, 246, 0.05)');
      outerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, w, h);

      // Draw globe sphere base (subtle glass effect)
      const sphereGradient = ctx.createRadialGradient(
        w / 2 - r * 0.3,
        h / 2 - r * 0.3,
        0,
        w / 2,
        h / 2,
        r
      );
      sphereGradient.addColorStop(0, 'rgba(100, 80, 150, 0.08)');
      sphereGradient.addColorStop(0.5, 'rgba(60, 50, 100, 0.05)');
      sphereGradient.addColorStop(1, 'rgba(30, 20, 60, 0.03)');

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.fillStyle = sphereGradient;
      ctx.fill();

      // Draw latitude lines
      latLines.forEach((lat) => {
        const y = h / 2 + Math.cos(lat) * r;
        const radiusAtLat = Math.sin(lat) * r;

        if (radiusAtLat > 0) {
          ctx.beginPath();
          ctx.ellipse(w / 2, y, radiusAtLat, radiusAtLat * 0.15, 0, 0, Math.PI * 2);
          const distFromEquator = Math.abs(lat - Math.PI / 2) / (Math.PI / 2);
          const opacity = 0.08 + (1 - distFromEquator) * 0.1;
          ctx.strokeStyle = `rgba(167, 139, 250, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // Draw longitude lines (rotating)
      for (let i = 0; i < numLongitudes; i++) {
        const angle = (i / numLongitudes) * Math.PI + rot;

        ctx.beginPath();
        ctx.ellipse(
          w / 2,
          h / 2,
          Math.abs(Math.cos(angle)) * r,
          r,
          0,
          0,
          Math.PI * 2
        );
        const opacity = 0.06 + Math.abs(Math.sin(angle)) * 0.12;
        ctx.strokeStyle = `rgba(167, 139, 250, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Collect visible points for connection lines
      const visiblePoints: { x: number; y: number; z: number; lead: boolean; idx: number }[] = [];

      // Draw points
      points.forEach((p, idx) => {
        const pos = project(p.theta, p.phi, rot);

        // Only draw points on visible side
        if (pos.a > 0.4) {
          visiblePoints.push({ x: pos.x, y: pos.y, z: pos.z, lead: p.lead, idx });

          // Draw glow for lead points
          if (p.lead) {
            const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.size * 4 * pos.a);
            gradient.addColorStop(0, p.glowColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, p.size * 4 * pos.a, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }

          // Draw point
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, p.size * pos.a, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.6 + pos.a * 0.4;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      // Draw connection lines between nearby lead points
      visiblePoints
        .filter((p) => p.lead)
        .forEach((p1, i, leadPoints) => {
          leadPoints.slice(i + 1).forEach((p2) => {
            const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

            if (dist < r * 0.8 && dist > 20) {
              const alpha = (1 - dist / (r * 0.8)) * 0.5;

              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(99, 200, 160, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });
        });

      // Draw sphere edge glow
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner highlight
      const innerHighlight = ctx.createRadialGradient(
        w / 2 - r * 0.4,
        h / 2 - r * 0.4,
        0,
        w / 2 - r * 0.4,
        h / 2 - r * 0.4,
        r * 0.5
      );
      innerHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      innerHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = innerHighlight;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* Globe container */}
      <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px]">
        {/* Outer glow rings */}
        <div 
          className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/15 to-purple-500/10 blur-2xl"
          style={{ animation: 'pulse 3s ease-in-out infinite' }}
        />
        <div 
          className="absolute inset-[-10px] rounded-full border border-purple-500/10"
          style={{ animation: 'spin 60s linear infinite' }}
        />
        <div 
          className="absolute inset-[-5px] rounded-full border border-dashed border-purple-500/5"
          style={{ animation: 'spin 45s linear infinite reverse' }}
        />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* Status text - only shown when searching */}
      {isSearching && (
        <div className="mt-8 sm:mt-12 text-center space-y-3 px-4">
          <h3 className="text-sm sm:text-base font-semibold tracking-[0.2em] text-white/90 uppercase">
            ANALISANDO O MERCADO DA SUA REGIÃO
          </h3>
          <p 
            className="text-sm sm:text-base text-purple-300/80 transition-opacity duration-300"
            style={{ opacity: messageOpacity }}
          >
            {ROTATING_MESSAGES[currentMessageIndex]}
          </p>

          {/* Progress bar */}
          <div className="w-64 sm:w-80 mx-auto mt-6">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 1), rgba(139, 92, 246, 0.8))',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </div>
  );
}
