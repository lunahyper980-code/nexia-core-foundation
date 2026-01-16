import { useEffect, useRef } from 'react';

interface PremiumGlobeCanvasProps {
  size?: number;
  className?: string;
}

export function PremiumGlobeCanvas({ size = 400, className = '' }: PremiumGlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const w = size;
    const h = size;
    const r = Math.min(w, h) * 0.38;
    const centerX = w / 2;
    const centerY = h / 2;

    interface Point {
      theta: number;
      phi: number;
      lead: boolean;
      size: number;
      color: string;
    }

    const points: Point[] = [];
    
    // Create 500 points distributed on the sphere
    for (let i = 0; i < 500; i++) {
      const isLead = Math.random() > 0.85;
      points.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(Math.random() * 2 - 1),
        lead: isLead,
        size: isLead ? 3 : 1.2,
        color: isLead ? '#22c55e' : '#a855f7',
      });
    }

    let animationId: number;
    let rot = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      rot += 0.003;

      // Draw outer glow
      const outerGlow = ctx.createRadialGradient(centerX, centerY, r * 0.3, centerX, centerY, r * 1.5);
      outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      outerGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.04)');
      outerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, w, h);

      // Draw sphere base with subtle gradient
      const sphereGradient = ctx.createRadialGradient(
        centerX - r * 0.3,
        centerY - r * 0.3,
        0,
        centerX,
        centerY,
        r
      );
      sphereGradient.addColorStop(0, 'rgba(60, 50, 80, 0.15)');
      sphereGradient.addColorStop(0.5, 'rgba(40, 30, 60, 0.1)');
      sphereGradient.addColorStop(1, 'rgba(20, 15, 35, 0.08)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fillStyle = sphereGradient;
      ctx.fill();

      // Draw longitude lines (rotating)
      const numLongitudes = 16;
      for (let i = 0; i < numLongitudes; i++) {
        const angle = (i / numLongitudes) * Math.PI + rot;
        
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(Math.cos(angle)) * r,
          r,
          0,
          0,
          Math.PI * 2
        );
        const opacity = 0.08 + Math.abs(Math.sin(angle)) * 0.08;
        ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw latitude lines
      const numLatitudes = 10;
      for (let i = 1; i < numLatitudes; i++) {
        const y = centerY + (i - numLatitudes / 2) * (r * 2 / numLatitudes);
        const distFromCenter = Math.abs(y - centerY);
        const latRadius = Math.sqrt(r * r - distFromCenter * distFromCenter);
        
        if (latRadius > 0) {
          ctx.beginPath();
          ctx.ellipse(centerX, y, latRadius, latRadius * 0.15, 0, 0, Math.PI * 2);
          const opacity = 0.06 + (1 - distFromCenter / r) * 0.1;
          ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Project and draw points
      const projectedPoints: Array<{ x: number; y: number; z: number; point: Point; a: number }> = [];

      points.forEach((p) => {
        const x = r * Math.sin(p.phi) * Math.cos(p.theta + rot);
        const y = r * Math.cos(p.phi);
        const z = r * Math.sin(p.phi) * Math.sin(p.theta + rot) + r;
        const scale = (r * 2) / (r * 2 + z);

        projectedPoints.push({
          x: x * scale + centerX,
          y: y * scale + centerY,
          z,
          point: p,
          a: scale,
        });
      });

      // Sort by z for proper depth ordering
      projectedPoints.sort((a, b) => b.z - a.z);

      // Draw connections between nearby visible points
      projectedPoints.forEach((p1, i) => {
        if (p1.z < r * 0.5) return; // Only front hemisphere
        
        projectedPoints.slice(i + 1, i + 15).forEach((p2) => {
          if (p2.z < r * 0.5) return;
          
          const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
          
          if (dist < 50 && dist > 5) {
            const alpha = (1 - dist / 50) * 0.15 * Math.min(p1.a, p2.a);
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Draw all points
      projectedPoints.forEach(({ x, y, point, a }) => {
        // Glow
        ctx.beginPath();
        ctx.arc(x, y, point.size * a * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = point.lead 
          ? `rgba(34, 197, 94, ${0.3 * a})` 
          : `rgba(168, 85, 247, ${0.2 * a})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, point.size * a, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.globalAlpha = a;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Inner glow
      const innerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r * 0.5);
      innerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
      innerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Outer edge glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [size]);

  return (
    <div className={`relative ${className}`}>
      {/* Outer glow rings */}
      <div 
        className="absolute inset-[-20px] border border-dashed border-primary/10 rounded-full"
        style={{ animation: 'spin 50s linear infinite' }}
      />
      <div 
        className="absolute inset-[-10px] border border-primary/5 rounded-full"
        style={{ animation: 'spin 35s linear infinite reverse' }}
      />
      
      {/* Canvas */}
      <canvas 
        ref={canvasRef}
        className="relative"
        style={{
          width: size,
          height: size,
        }}
      />
      
      {/* Background glow */}
      <div className="absolute inset-[-30px] rounded-full bg-primary/5 blur-3xl -z-10" />
    </div>
  );
}
