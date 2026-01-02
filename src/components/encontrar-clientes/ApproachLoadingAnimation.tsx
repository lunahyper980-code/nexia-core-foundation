import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface ApproachLoadingAnimationProps {
  open: boolean;
}

const PROGRESS_MESSAGES = [
  { text: 'Analisando o contexto do negócio...', duration: 1200 },
  { text: 'Preparando mensagem personalizada...', duration: 1000 },
  { text: 'Ajustando tom de comunicação...', duration: 1000 },
  { text: 'Finalizando abordagem...', duration: 1200 },
];

export function ApproachLoadingAnimation({ open }: ApproachLoadingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [visible, setVisible] = useState(false);
  const [messageOpacity, setMessageOpacity] = useState(1);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setCurrentMessage(0);
    }
  }, [open]);

  // Rotate messages with fade effect
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setMessageOpacity(0);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
        setMessageOpacity(1);
      }, 300);
    }, 2200);

    return () => clearInterval(interval);
  }, [open]);

  // Canvas neural network animation - premium style like NeuralAnimation
  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;

    // Neural network nodes - message themed
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      layer: number;
      isMessage: boolean;
    }

    const nodes: Node[] = [];
    const nodeCount = 50;

    // Create nodes in circular layers with some as message bubbles
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + Math.random() * 0.5;
      const layer = Math.floor(Math.random() * 3);
      const radius = 50 + layer * 35 + Math.random() * 25;

      nodes.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1.5,
        layer,
        isMessage: Math.random() > 0.7,
      });
    }

    // Orbiting message particles
    interface MessageParticle {
      angle: number;
      speed: number;
      orbitRadius: number;
      size: number;
    }

    const messageParticles: MessageParticle[] = [];
    for (let i = 0; i < 12; i++) {
      messageParticles.push({
        angle: (i / 12) * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.005,
        orbitRadius: 70 + Math.random() * 50,
        size: 12 + Math.random() * 8,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(10, 10, 25, 0.12)';
      ctx.fillRect(0, 0, size, size);

      // Draw central core with pulsing glow
      const corePulse = Math.sin(time * 2) * 0.4 + 0.6;

      // Outer glow rings
      for (let ring = 3; ring >= 0; ring--) {
        const ringRadius = 35 + ring * 22 + Math.sin(time * 1.5 + ring) * 4;
        const ringAlpha = 0.05 + (3 - ring) * 0.03;

        const ringGradient = ctx.createRadialGradient(
          centerX, centerY, ringRadius * 0.5,
          centerX, centerY, ringRadius
        );
        ringGradient.addColorStop(0, `rgba(139, 92, 246, ${ringAlpha * corePulse})`);
        ringGradient.addColorStop(0.5, `rgba(99, 102, 241, ${ringAlpha * corePulse * 0.5})`);
        ringGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.fillStyle = ringGradient;
        ctx.fill();
      }

      // Core gradient
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 40
      );
      coreGradient.addColorStop(0, `rgba(168, 85, 247, ${0.9 * corePulse})`);
      coreGradient.addColorStop(0.4, `rgba(139, 92, 246, ${0.6 * corePulse})`);
      coreGradient.addColorStop(0.7, `rgba(99, 102, 241, ${0.3 * corePulse})`);
      coreGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Draw orbiting message bubbles
      messageParticles.forEach((particle, i) => {
        particle.angle += particle.speed;

        const px = centerX + Math.cos(particle.angle) * particle.orbitRadius;
        const py = centerY + Math.sin(particle.angle) * particle.orbitRadius;
        const pulse = Math.sin(time * 2 + i) * 0.2 + 0.8;

        // Draw message bubble shape
        const bw = particle.size * 1.5;
        const bh = particle.size;
        const bx = px - bw / 2;
        const by = py - bh / 2;
        const radius = 4;

        ctx.beginPath();
        ctx.moveTo(bx + radius, by);
        ctx.lineTo(bx + bw - radius, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + radius);
        ctx.lineTo(bx + bw, by + bh - radius);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - radius, by + bh);
        ctx.lineTo(bx + bw * 0.35, by + bh);
        ctx.lineTo(bx + bw * 0.25, by + bh + 5);
        ctx.lineTo(bx + bw * 0.25, by + bh);
        ctx.lineTo(bx + radius, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - radius);
        ctx.lineTo(bx, by + radius);
        ctx.quadraticCurveTo(bx, by, bx + radius, by);
        ctx.closePath();

        const bubbleGradient = ctx.createRadialGradient(
          px, py, 0,
          px, py, particle.size
        );
        bubbleGradient.addColorStop(0, `rgba(192, 132, 252, ${0.7 * pulse})`);
        bubbleGradient.addColorStop(1, `rgba(139, 92, 246, ${0.3 * pulse})`);
        
        ctx.fillStyle = bubbleGradient;
        ctx.fill();

        // Glow behind bubble
        const glowGradient = ctx.createRadialGradient(px, py, 0, px, py, particle.size * 2);
        glowGradient.addColorStop(0, `rgba(168, 85, 247, ${0.3 * pulse})`);
        glowGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

        ctx.beginPath();
        ctx.arc(px, py, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Text lines inside bubble
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * pulse})`;
        ctx.fillRect(px - bw * 0.35, py - 2, bw * 0.5, 2);
        ctx.fillRect(px - bw * 0.35, py + 2, bw * 0.3, 2);
      });

      // Update and draw neural nodes
      nodes.forEach((node, i) => {
        // Gentle orbital movement
        const orbitAngle = time * 0.3 + i * 0.1;
        node.x += node.vx + Math.cos(orbitAngle) * 0.15;
        node.y += node.vy + Math.sin(orbitAngle) * 0.15;

        // Boundary check with smooth bounce
        if (node.x < 25 || node.x > size - 25) node.vx *= -0.95;
        if (node.y < 25 || node.y > size - 25) node.vy *= -0.95;

        // Draw connections to nearby nodes
        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            const alpha = (1 - dist / 60) * 0.4;
            const pulse = Math.sin(time * 4 + i * 0.3) * 0.3 + 0.7;

            // Animated data flow effect
            const flowOffset = (time * 2 + i * 0.5) % 1;

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);

            const lineGradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
            lineGradient.addColorStop(0, `rgba(99, 102, 241, ${alpha * pulse * 0.3})`);
            lineGradient.addColorStop(flowOffset, `rgba(168, 85, 247, ${alpha * pulse})`);
            lineGradient.addColorStop(Math.min(flowOffset + 0.2, 1), `rgba(99, 102, 241, ${alpha * pulse * 0.3})`);

            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw node with layered glow
        const nodePulse = Math.sin(time * 3 + i * 0.5) * 0.4 + 0.6;
        const glowSize = node.radius * 4;

        const nodeGlow = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowSize
        );
        nodeGlow.addColorStop(0, `rgba(168, 85, 247, ${0.6 * nodePulse})`);
        nodeGlow.addColorStop(0.4, `rgba(139, 92, 246, ${0.25 * nodePulse})`);
        nodeGlow.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = nodeGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + nodePulse * 0.3})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    // Initial fill
    ctx.fillStyle = 'rgba(10, 10, 25, 1)';
    ctx.fillRect(0, 0, size, size);

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [visible]);

  useEffect(() => {
    if (!open && visible) {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open, visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
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

          {/* Message icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="p-5 rounded-full bg-slate-900/60 backdrop-blur-sm border border-purple-500/30"
              style={{
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
                animation: 'iconPulse 2s ease-in-out infinite',
              }}
            >
              <MessageCircle className="h-10 w-10 text-purple-300" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gerando Mensagem
          </h2>
          <p
            className="text-purple-200/70 text-sm sm:text-base max-w-xs mx-auto transition-opacity duration-300"
            style={{ opacity: messageOpacity }}
          >
            {PROGRESS_MESSAGES[currentMessage].text}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mt-4">
          {PROGRESS_MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentMessage
                  ? 'bg-gradient-to-r from-purple-400 to-violet-400 scale-125'
                  : 'bg-gray-600/50'
              }`}
            />
          ))}
        </div>

        {/* Animated progress bar */}
        <div className="w-full max-w-xs mt-6">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              style={{
                animation: 'loadProgress 3s ease-in-out infinite',
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
        @keyframes loadProgress {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 100%; }
        }
        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
