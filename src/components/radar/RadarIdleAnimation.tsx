import { useEffect, useRef, useState } from 'react';

/**
 * Futuristic robot scanner idle animation inspired by the reference image.
 * Features: robot silhouette, scrolling terminal data, stats panel, progress bar.
 */
export function RadarIdleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [scanLines, setScanLines] = useState<string[]>([]);

  // Generate fake scan data lines
  useEffect(() => {
    const lines = [
      '> Inicializando módulo RADAR...',
      '> Conectando ao banco de dados...',
      '> Verificando geolocalização...',
      '> Carregando modelo de IA...',
      '> Módulo de prospecção: ONLINE',
      '> Scanner de empresas: PRONTO',
      '> Análise de mercado: ATIVA',
      '> Detecção de oportunidades: OK',
      '> Mapeamento regional: STANDBY',
      '> Algoritmo de matching: v3.2.1',
      '> Base de dados: 142.857 registros',
      '> Cobertura: Brasil completo',
      '> Precisão estimada: 94.7%',
      '> Aguardando localização...',
    ];
    setScanLines(lines);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Robot body parts (relative to center)
    const drawRobot = (cx: number, cy: number, scale: number, t: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Subtle floating animation
      const floatY = Math.sin(t * 0.02) * 3;
      ctx.translate(0, floatY);

      // Head - visor style
      const headGrad = ctx.createLinearGradient(-18, -75, 18, -55);
      headGrad.addColorStop(0, 'hsla(260, 70%, 70%, 0.9)');
      headGrad.addColorStop(1, 'hsla(260, 50%, 40%, 0.9)');

      // Head shape
      ctx.beginPath();
      ctx.ellipse(0, -65, 20, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(240, 20%, 15%, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'hsla(260, 60%, 60%, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Visor
      ctx.beginPath();
      ctx.ellipse(0, -67, 14, 6, 0, 0, Math.PI * 2);
      const visorGlow = 0.5 + Math.sin(t * 0.05) * 0.3;
      ctx.fillStyle = `hsla(200, 90%, 70%, ${visorGlow})`;
      ctx.fill();
      ctx.shadowColor = 'hsla(200, 90%, 60%, 0.6)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Neck
      ctx.fillStyle = 'hsla(240, 15%, 20%, 0.9)';
      ctx.fillRect(-5, -45, 10, 8);

      // Torso
      ctx.beginPath();
      ctx.moveTo(-22, -37);
      ctx.lineTo(22, -37);
      ctx.lineTo(18, 15);
      ctx.lineTo(-18, 15);
      ctx.closePath();
      ctx.fillStyle = 'hsla(240, 15%, 12%, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'hsla(260, 50%, 50%, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Chest light
      ctx.beginPath();
      ctx.arc(0, -15, 5, 0, Math.PI * 2);
      const chestGlow = 0.4 + Math.sin(t * 0.08) * 0.3;
      ctx.fillStyle = `hsla(160, 90%, 55%, ${chestGlow})`;
      ctx.fill();
      ctx.shadowColor = 'hsla(160, 90%, 55%, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Arms
      const armSwing = Math.sin(t * 0.03) * 5;
      // Left arm
      ctx.save();
      ctx.translate(-22, -32);
      ctx.rotate((-0.15 + Math.sin(t * 0.025) * 0.05));
      ctx.fillStyle = 'hsla(240, 15%, 18%, 0.9)';
      ctx.fillRect(-6, 0, 8, 35);
      // Hand
      ctx.beginPath();
      ctx.arc(-2, 38, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(240, 10%, 25%, 0.9)';
      ctx.fill();
      ctx.restore();

      // Right arm
      ctx.save();
      ctx.translate(22, -32);
      ctx.rotate((0.15 - Math.sin(t * 0.025) * 0.05));
      ctx.fillStyle = 'hsla(240, 15%, 18%, 0.9)';
      ctx.fillRect(-2, 0, 8, 35);
      ctx.beginPath();
      ctx.arc(2, 38, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(240, 10%, 25%, 0.9)';
      ctx.fill();
      ctx.restore();

      // Legs
      ctx.fillStyle = 'hsla(240, 15%, 14%, 0.9)';
      ctx.fillRect(-14, 15, 10, 30);
      ctx.fillRect(4, 15, 10, 30);

      // Feet
      ctx.fillStyle = 'hsla(240, 10%, 22%, 0.9)';
      ctx.fillRect(-16, 45, 14, 6);
      ctx.fillRect(2, 45, 14, 6);

      ctx.restore();
    };

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      frame++;

      // Background gradient - dark purple/blue
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.7);
      bg.addColorStop(0, 'hsla(260, 50%, 18%, 1)');
      bg.addColorStop(0.5, 'hsla(260, 40%, 10%, 1)');
      bg.addColorStop(1, 'hsla(240, 30%, 5%, 1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = 'hsla(260, 40%, 30%, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Horizontal scan line
      const scanY = (frame * 0.5) % h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
      scanGrad.addColorStop(0, 'hsla(260, 80%, 60%, 0)');
      scanGrad.addColorStop(0.5, 'hsla(260, 80%, 60%, 0.08)');
      scanGrad.addColorStop(1, 'hsla(260, 80%, 60%, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 15, w, 30);

      // Draw robot in center
      const robotScale = Math.min(w, h) / 280;
      drawRobot(w * 0.5, h * 0.5 + 10, robotScale, frame);

      // Left terminal panel
      ctx.save();
      const panelX = 12;
      const panelY = 16;
      const panelW = Math.min(w * 0.28, 160);
      const panelH = h - 55;

      // Panel bg
      ctx.fillStyle = 'hsla(240, 30%, 8%, 0.6)';
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeStyle = 'hsla(260, 50%, 40%, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelY, panelW, panelH);

      // Terminal text
      ctx.font = '9px monospace';
      const visibleLines = Math.floor(panelH / 14);
      const scrollOffset = Math.floor(frame * 0.02) % (scanLines.length + 5);
      
      for (let i = 0; i < visibleLines && i < scanLines.length; i++) {
        const lineIdx = (i + scrollOffset) % scanLines.length;
        const alpha = 0.3 + (i / visibleLines) * 0.5;
        ctx.fillStyle = `hsla(160, 80%, 60%, ${alpha})`;
        const text = scanLines[lineIdx] || '';
        ctx.fillText(text.substring(0, Math.floor(panelW / 5.5)), panelX + 6, panelY + 14 + i * 14);
      }
      ctx.restore();

      // Right stats panel
      ctx.save();
      const statsX = w - panelW - 12;
      const statsY = 16;
      const statsH = 110;

      ctx.fillStyle = 'hsla(240, 30%, 8%, 0.6)';
      ctx.fillRect(statsX, statsY, panelW, statsH);
      ctx.strokeStyle = 'hsla(260, 50%, 40%, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(statsX, statsY, panelW, statsH);

      // Stats content
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'hsla(160, 80%, 60%, 0.8)';
      ctx.fillText('◆ STATUS', statsX + 8, statsY + 16);
      
      ctx.font = '9px monospace';
      ctx.fillStyle = 'hsla(200, 70%, 70%, 0.7)';
      ctx.fillText('▸ Motor IA: Ativo', statsX + 8, statsY + 34);
      
      const dotPulse = Math.sin(frame * 0.1) > 0 ? '●' : '○';
      ctx.fillStyle = 'hsla(120, 80%, 55%, 0.8)';
      ctx.fillText(`${dotPulse} Online`, statsX + 8, statsY + 50);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = 'hsla(280, 70%, 70%, 0.8)';
      const countAnim = Math.min(Math.floor(frame * 0.3), 142857);
      ctx.fillText(`${countAnim.toLocaleString()}`, statsX + 8, statsY + 72);
      ctx.font = '8px monospace';
      ctx.fillStyle = 'hsla(260, 40%, 60%, 0.5)';
      ctx.fillText('empresas no banco', statsX + 8, statsY + 84);

      ctx.fillStyle = 'hsla(30, 90%, 60%, 0.7)';
      ctx.font = '9px monospace';
      ctx.fillText('⚡ Pronto p/ escanear', statsX + 8, statsY + 100);
      ctx.restore();

      // Bottom progress bar area
      ctx.save();
      const barY = h - 32;
      const barH = 4;
      const barX = 12;
      const barW = w - 24;

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = 'hsla(260, 40%, 60%, 0.5)';
      ctx.fillText('PROGRESS', barX, barY - 6);

      // Bar bg
      ctx.fillStyle = 'hsla(240, 20%, 15%, 0.8)';
      ctx.fillRect(barX, barY, barW, barH);

      // Bar fill - animated pulse
      const progress = (Math.sin(frame * 0.015) + 1) / 2;
      const barGrad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
      barGrad.addColorStop(0, 'hsla(260, 70%, 55%, 0.9)');
      barGrad.addColorStop(1, 'hsla(200, 90%, 55%, 0.9)');
      ctx.fillStyle = barGrad;
      ctx.fillRect(barX, barY, barW * progress, barH);

      // Bottom label
      ctx.font = '8px monospace';
      ctx.fillStyle = 'hsla(200, 60%, 60%, 0.4)';
      ctx.fillText('Aguardando input de localização...', barX, barY + 16);

      // Percentage
      ctx.fillStyle = 'hsla(200, 70%, 70%, 0.6)';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${Math.floor(progress * 100)}%`, barX + barW - 24, barY - 6);
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [scanLines]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl"
    />
  );
}
