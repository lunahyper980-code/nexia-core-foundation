import { useEffect, useRef, useState } from 'react';

const STEPS = [
  'Inicializando radar...',
  'Escaneando região...',
  'Detectando empresas...',
  'Analisando oportunidades...',
  'Classificando resultados...',
  'Finalizando varredura...',
];

interface RadarScanAnimationProps {
  isActive: boolean;
}

export function RadarScanAnimation({ isActive }: RadarScanAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [stepIndex, setStepIndex] = useState(0);
  const dotsRef = useRef<{ x: number; y: number; opacity: number; scale: number }[]>([]);

  // Progress steps
  useEffect(() => {
    if (!isActive) { setStepIndex(0); return; }
    const interval = setInterval(() => {
      setStepIndex(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [isActive]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d')!;
    let angle = 0;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const addDot = () => {
      const a = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 100;
      dotsRef.current.push({
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        opacity: 1,
        scale: 0.3 + Math.random() * 0.7,
      });
      if (dotsRef.current.length > 30) dotsRef.current.shift();
    };

    let dotTimer = 0;

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) * 0.7;

      ctx.clearRect(0, 0, w, h);

      // Background rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(160, 80%, 50%, ${0.08 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Cross lines
      ctx.strokeStyle = 'hsla(160, 80%, 50%, 0.06)';
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Sweep gradient
      const sweepAngle = 0.6;
      // Sweep arc with gradient
      // Fallback: draw sweep as arc fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle - sweepAngle, angle);
      ctx.closePath();
      const lg = ctx.createLinearGradient(
        cx + Math.cos(angle - sweepAngle) * radius,
        cy + Math.sin(angle - sweepAngle) * radius,
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius,
      );
      lg.addColorStop(0, 'hsla(160, 90%, 50%, 0)');
      lg.addColorStop(1, 'hsla(160, 90%, 50%, 0.25)');
      ctx.fillStyle = lg;
      ctx.fill();
      ctx.restore();

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.strokeStyle = 'hsla(160, 90%, 55%, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(160, 90%, 55%)';
      ctx.fill();

      // Detected dots
      dotsRef.current.forEach(dot => {
        dot.opacity = Math.max(0, dot.opacity - 0.003);
        ctx.beginPath();
        ctx.arc(cx + dot.x, cy + dot.y, 3 * dot.scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(160, 90%, 60%, ${dot.opacity})`;
        ctx.fill();
        // Ping ring
        if (dot.opacity > 0.6) {
          ctx.beginPath();
          ctx.arc(cx + dot.x, cy + dot.y, 8 * dot.scale * (1.3 - dot.opacity), 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(160, 90%, 60%, ${dot.opacity * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      angle += 0.025;
      dotTimer++;
      if (dotTimer % 18 === 0) addDot();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        className="w-[340px] h-[340px] sm:w-[420px] sm:h-[420px]"
      />
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-primary font-semibold text-lg tracking-wide animate-pulse">
          {STEPS[stepIndex]}
        </p>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= stepIndex ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
