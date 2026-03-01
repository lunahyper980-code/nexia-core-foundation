import { useEffect, useRef } from 'react';

/**
 * Idle animation for the Radar form card - a subtle scanning line 
 * that sweeps across, with floating grid dots, giving a "scanner ready" vibe.
 */
export function RadarIdleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let sweepY = 0;
    let direction = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Grid dots
    const dots: { x: number; y: number; baseAlpha: number }[] = [];
    const initDots = () => {
      dots.length = 0;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const spacing = 40;
      for (let x = spacing; x < w; x += spacing) {
        for (let y = spacing; y < h; y += spacing) {
          dots.push({ x, y, baseAlpha: 0.04 + Math.random() * 0.04 });
        }
      }
    };
    initDots();

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      // Draw grid dots - light up near sweep
      dots.forEach(dot => {
        const dist = Math.abs(dot.y - sweepY);
        const glow = dist < 60 ? (1 - dist / 60) * 0.3 : 0;
        const alpha = dot.baseAlpha + glow;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(160, 80%, 55%, ${alpha})`;
        ctx.fill();
      });

      // Sweep line
      const grad = ctx.createLinearGradient(0, sweepY - 2, 0, sweepY + 2);
      grad.addColorStop(0, 'hsla(160, 90%, 55%, 0)');
      grad.addColorStop(0.5, 'hsla(160, 90%, 55%, 0.25)');
      grad.addColorStop(1, 'hsla(160, 90%, 55%, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, sweepY - 20, w, 40);

      // Thin bright line
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(w, sweepY);
      ctx.strokeStyle = 'hsla(160, 90%, 55%, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      sweepY += 0.4 * direction;
      if (sweepY > h) direction = -1;
      if (sweepY < 0) direction = 1;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
