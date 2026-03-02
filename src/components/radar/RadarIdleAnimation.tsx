import { useEffect, useRef, useState } from 'react';

/**
 * Futuristic drone scanner animation.
 * Idle: gentle float, slow scanner, ambient panels.
 * Scanning: circular patrol, aggressive scanner, detection pings, city grid.
 */

interface DetectedPoint {
  x: number;
  y: number;
  opacity: number;
  birthFrame: number;
  ringRadius: number;
}

export function RadarIdleAnimation({ isScanning = false, scanProgress = 0 }: { isScanning?: boolean; scanProgress?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const isScanningRef = useRef(isScanning);
  const scanProgressRef = useRef(scanProgress);
  const detectedPointsRef = useRef<DetectedPoint[]>([]);
  const [scanLines] = useState<string[]>([
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
  ]);

  const scanningLines = [
    '> SCAN ATIVO — Buscando sinais...',
    '> Empresa detectada: verificando...',
    '> Analisando presença digital...',
    '> Verificando website: AUSENTE',
    '> Verificando Instagram: AUSENTE',
    '> Oportunidade identificada ★',
    '> Classificando segmento...',
    '> Cruzando dados regionais...',
    '> Novo sinal captado ◆',
    '> Validando informações...',
    '> Mapeando endereço...',
    '> Empresa sem site detectada!',
    '> Potencial cliente encontrado',
    '> Adicionando ao relatório...',
    '> Continuando varredura...',
    '> Ampliando raio de busca...',
  ];

  useEffect(() => { isScanningRef.current = isScanning; }, [isScanning]);
  useEffect(() => { scanProgressRef.current = scanProgress; }, [scanProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Draw professional drone
    const drawDrone = (cx: number, cy: number, scale: number, t: number, scanning: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      const floatSpeed = scanning ? 0.05 : 0.025;
      const floatAmp = scanning ? 3 : 5;
      const tiltAmp = scanning ? 0.06 : 0.03;
      const floatY = Math.sin(t * floatSpeed) * floatAmp;
      const tiltX = Math.sin(t * floatSpeed * 0.6) * tiltAmp;
      ctx.translate(0, floatY);
      ctx.rotate(tiltX);

      // Scanner light cone
      const scanPulse = scanning ? 0.22 + Math.sin(t * 0.08) * 0.08 : 0.12 + Math.sin(t * 0.04) * 0.06;
      const scanSwing = scanning ? Math.sin(t * 0.04) * 35 : Math.sin(t * 0.018) * 18;
      const coneWidth = scanning ? 50 : 40;
      const coneLen = scanning ? 155 : 135;

      ctx.save();
      ctx.translate(0, 14);
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(scanSwing - coneWidth, coneLen);
      ctx.lineTo(scanSwing + coneWidth, coneLen);
      ctx.lineTo(3, 0);
      ctx.closePath();
      const coneColor = scanning ? '160, 90%, 55%' : '200, 95%, 65%';
      const scanGrad = ctx.createLinearGradient(0, 0, 0, coneLen);
      scanGrad.addColorStop(0, `hsla(${coneColor}, ${scanPulse + 0.15})`);
      scanGrad.addColorStop(0.4, `hsla(${coneColor}, ${scanPulse * 0.4})`);
      scanGrad.addColorStop(1, `hsla(${coneColor}, 0)`);
      ctx.fillStyle = scanGrad;
      ctx.fill();
      ctx.beginPath();
      const groundW = scanning ? 55 : 44;
      ctx.ellipse(scanSwing, coneLen, groundW, 8, 0, 0, Math.PI * 2);
      const groundGlow = scanning ? 0.12 + Math.sin(t * 0.08) * 0.06 : 0.06 + Math.sin(t * 0.04) * 0.03;
      ctx.fillStyle = `hsla(${coneColor}, ${groundGlow})`;
      ctx.fill();
      ctx.restore();

      const bodyColor = 'hsla(220, 12%, 16%, 0.97)';
      const bodyHighlight = 'hsla(220, 10%, 24%, 0.95)';
      const accentHue = scanning ? '160, 50%, 40%' : '220, 40%, 45%';
      const propSpeed = scanning ? 0.8 : 0.4;

      // ── 4 Arms with motors + propellers (like reference: wide, slightly curved) ──
      const armConfigs = [
        { ex: -52, ey: -6, cx1: -18, cy1: -2, cx2: -38, cy2: -6 },   // top-left
        { ex: 52, ey: -6, cx1: 18, cy1: -2, cx2: 38, cy2: -6 },      // top-right
        { ex: -46, ey: 8, cx1: -16, cy1: 4, cx2: -34, cy2: 8 },      // bottom-left
        { ex: 46, ey: 8, cx1: 16, cy1: 4, cx2: 34, cy2: 8 },         // bottom-right
      ];

      for (let i = 0; i < armConfigs.length; i++) {
        const arm = armConfigs[i];

        // Arm tube — thick, slightly curved
        ctx.beginPath();
        ctx.moveTo(0, -1);
        ctx.bezierCurveTo(arm.cx1, arm.cy1 - 2, arm.cx2, arm.cy2 - 2.5, arm.ex, arm.ey - 2);
        ctx.lineTo(arm.ex, arm.ey + 2);
        ctx.bezierCurveTo(arm.cx2, arm.cy2 + 2.5, arm.cx1, arm.cy1 + 2, 0, 3);
        ctx.closePath();
        const armGrad = ctx.createLinearGradient(0, 0, arm.ex, arm.ey);
        armGrad.addColorStop(0, bodyHighlight);
        armGrad.addColorStop(0.5, bodyColor);
        armGrad.addColorStop(1, 'hsla(220, 12%, 20%, 0.97)');
        ctx.fillStyle = armGrad;
        ctx.fill();

        // Motor pod
        ctx.beginPath();
        ctx.arc(arm.ex, arm.ey, 6, 0, Math.PI * 2);
        const mGrad = ctx.createRadialGradient(arm.ex - 1, arm.ey - 1, 0, arm.ex, arm.ey, 6.5);
        mGrad.addColorStop(0, 'hsla(220, 10%, 30%, 0.97)');
        mGrad.addColorStop(0.6, 'hsla(220, 10%, 18%, 0.97)');
        mGrad.addColorStop(1, 'hsla(220, 12%, 12%, 0.97)');
        ctx.fillStyle = mGrad;
        ctx.fill();
        ctx.strokeStyle = `hsla(${accentHue}, 0.2)`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Motor cap
        ctx.beginPath();
        ctx.arc(arm.ex, arm.ey, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(220, 8%, 32%, 0.9)';
        ctx.fill();

        // Propeller blades — 2 thick curved blades with motion blur
        const bladeLen = 22;
        const bladeAlpha = 0.25 + Math.sin(t * 0.08) * 0.08;

        // Motion blur disc
        ctx.beginPath();
        ctx.arc(arm.ex, arm.ey, bladeLen, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(200, 15%, 55%, ${bladeAlpha * 0.15})`;
        ctx.fill();

        // Individual blades
        for (let b = 0; b < 2; b++) {
          const bAngle = t * propSpeed + b * Math.PI + i * 0.8;
          ctx.save();
          ctx.translate(arm.ex, arm.ey);
          ctx.rotate(bAngle);
          // Thick, tapered blade like real drone propeller
          ctx.beginPath();
          ctx.moveTo(2, 0);
          ctx.quadraticCurveTo(bladeLen * 0.3, -3, bladeLen * 0.7, -2.2);
          ctx.quadraticCurveTo(bladeLen * 0.9, -1.5, bladeLen, -0.5);
          ctx.lineTo(bladeLen, 0.3);
          ctx.quadraticCurveTo(bladeLen * 0.9, 1, bladeLen * 0.7, 1);
          ctx.quadraticCurveTo(bladeLen * 0.3, 1.5, 2, 0);
          ctx.fillStyle = `hsla(220, 10%, 14%, ${bladeAlpha})`;
          ctx.fill();
          ctx.restore();
        }
      }

      // ── Central body — rounded rectangular like DJI Phantom ──
      // Body shadow
      ctx.beginPath();
      ctx.ellipse(0, 6, 16, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(220, 15%, 8%, 0.3)';
      ctx.fill();

      // Main body top shell
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.quadraticCurveTo(-16, -10, -8, -12);
      ctx.lineTo(8, -12);
      ctx.quadraticCurveTo(16, -10, 16, 2);
      ctx.lineTo(16, 6);
      ctx.quadraticCurveTo(16, 10, 10, 11);
      ctx.lineTo(-10, 11);
      ctx.quadraticCurveTo(-16, 10, -16, 6);
      ctx.closePath();
      const bGrad = ctx.createLinearGradient(0, -12, 0, 11);
      bGrad.addColorStop(0, 'hsla(220, 10%, 28%, 0.97)');
      bGrad.addColorStop(0.3, 'hsla(220, 10%, 22%, 0.97)');
      bGrad.addColorStop(0.7, bodyColor);
      bGrad.addColorStop(1, 'hsla(220, 12%, 12%, 0.97)');
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.strokeStyle = `hsla(${accentHue}, 0.15)`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Body highlight strip
      ctx.beginPath();
      ctx.moveTo(-14, -1);
      ctx.lineTo(14, -1);
      ctx.strokeStyle = `hsla(${accentHue}, 0.3)`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Top surface detail line
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(6, -10);
      ctx.strokeStyle = 'hsla(220, 10%, 35%, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // ── Landing gear — curved legs ──
      ctx.strokeStyle = 'hsla(220, 10%, 25%, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      // Left leg
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.quadraticCurveTo(-13, 18, -11, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-5, 10);
      ctx.quadraticCurveTo(-8, 18, -6, 22);
      ctx.stroke();
      // Left skid bar
      ctx.beginPath();
      ctx.moveTo(-14, 22);
      ctx.lineTo(-3, 22);
      ctx.lineWidth = 2;
      ctx.stroke();
      // Right leg
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.quadraticCurveTo(13, 18, 11, 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5, 10);
      ctx.quadraticCurveTo(8, 18, 6, 22);
      ctx.stroke();
      // Right skid bar
      ctx.beginPath();
      ctx.moveTo(14, 22);
      ctx.lineTo(3, 22);
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── Camera gimbal ──
      // Gimbal neck
      ctx.fillStyle = 'hsla(220, 8%, 22%, 0.9)';
      ctx.fillRect(-2, 10, 4, 5);

      // Camera sphere
      ctx.beginPath();
      ctx.arc(0, 18, 5, 0, Math.PI * 2);
      const camGrad = ctx.createRadialGradient(-1, 17, 0, 0, 18, 5.5);
      camGrad.addColorStop(0, 'hsla(220, 10%, 28%, 0.97)');
      camGrad.addColorStop(0.7, 'hsla(220, 10%, 16%, 0.97)');
      camGrad.addColorStop(1, 'hsla(220, 12%, 10%, 0.97)');
      ctx.fillStyle = camGrad;
      ctx.fill();
      ctx.strokeStyle = 'hsla(220, 15%, 30%, 0.35)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Camera lens — glowing
      ctx.beginPath();
      ctx.arc(0, 18, 3, 0, Math.PI * 2);
      const lensHue = scanning ? '160, 95%, 55%' : '200, 95%, 65%';
      const lensGlow = scanning ? 0.75 + Math.sin(t * 0.12) * 0.25 : 0.5 + Math.sin(t * 0.06) * 0.3;
      ctx.fillStyle = `hsla(${lensHue}, ${lensGlow})`;
      ctx.fill();
      ctx.shadowColor = `hsla(${lensHue}, 0.7)`;
      ctx.shadowBlur = scanning ? 16 : 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner lens ring
      ctx.beginPath();
      ctx.arc(0, 18, 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${lensHue}, ${lensGlow * 0.5})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Lens reflection
      ctx.beginPath();
      ctx.arc(-0.8, 17, 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(0, 0%, 100%, 0.3)';
      ctx.fill();

      // ── Status LEDs on front ──
      if (scanning) {
        const led = Math.sin(t * 0.15) > 0 ? 0.9 : 0.3;
        ctx.beginPath(); ctx.arc(-10, -7, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(120, 90%, 50%, ${led})`; ctx.fill();
        ctx.shadowColor = `hsla(120, 90%, 50%, ${led * 0.5})`;
        ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(10, -7, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(120, 90%, 50%, ${1 - led})`; ctx.fill();
        ctx.shadowColor = `hsla(120, 90%, 50%, ${(1 - led) * 0.5})`;
        ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0;
      } else {
        const led1 = Math.sin(t * 0.1) > 0 ? 0.9 : 0.15;
        ctx.beginPath(); ctx.arc(-10, -7, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(120, 90%, 50%, ${led1})`; ctx.fill();
        ctx.beginPath(); ctx.arc(10, -7, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(0, 90%, 50%, ${1 - led1})`; ctx.fill();
      }

      ctx.restore();
    };

    // Draw detected business points (only during scan)
    const drawDetectedPoints = (w: number, h: number, t: number) => {
      const points = detectedPointsRef.current;
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        const age = t - p.birthFrame;
        p.opacity = Math.max(0, 1 - age / 200);
        p.ringRadius = Math.min(age * 0.3, 20);

        if (p.opacity <= 0) { points.splice(i, 1); continue; }

        // Ping ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(160, 90%, 55%, ${p.opacity * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(160, 90%, 60%, ${p.opacity})`;
        ctx.shadowColor = 'hsla(160, 90%, 55%, 0.6)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Small label
        if (p.opacity > 0.5) {
          ctx.font = '7px monospace';
          ctx.fillStyle = `hsla(160, 80%, 70%, ${p.opacity * 0.7})`;
          ctx.fillText('▸ detectado', p.x + 6, p.y + 3);
        }
      }
    };

    // Spawn detection point near scanner cone
    const spawnDetection = (droneX: number, groundY: number, scanSwing: number, w: number) => {
      const px = droneX + scanSwing + (Math.random() - 0.5) * 80;
      const py = groundY + (Math.random() - 0.5) * 20;
      if (px > 20 && px < w - 20) {
        detectedPointsRef.current.push({
          x: px, y: py, opacity: 1, birthFrame: frame, ringRadius: 0,
        });
        if (detectedPointsRef.current.length > 15) detectedPointsRef.current.shift();
      }
    };

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      frame++;
      const scanning = isScanningRef.current;

      // Clear canvas completely each frame (fixes mobile rendering)
      ctx.clearRect(0, 0, w, h);

      // Background
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.7);
      bg.addColorStop(0, scanning ? 'hsl(180, 30%, 10%)' : 'hsl(260, 30%, 12%)');
      bg.addColorStop(0.5, scanning ? 'hsl(180, 25%, 6%)' : 'hsl(260, 25%, 8%)');
      bg.addColorStop(1, scanning ? 'hsl(200, 20%, 3%)' : 'hsl(240, 20%, 4%)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Grid — brighter when scanning
      ctx.strokeStyle = scanning ? 'hsla(160, 40%, 30%, 0.08)' : 'hsla(260, 40%, 30%, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // Horizontal scan line
      const scanLineSpeed = scanning ? 1.2 : 0.5;
      const scanY = (frame * scanLineSpeed) % h;
      const hScanGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
      const scanLineColor = scanning ? '160, 80%, 50%' : '260, 80%, 60%';
      hScanGrad.addColorStop(0, `hsla(${scanLineColor}, 0)`);
      hScanGrad.addColorStop(0.5, `hsla(${scanLineColor}, ${scanning ? 0.12 : 0.08})`);
      hScanGrad.addColorStop(1, `hsla(${scanLineColor}, 0)`);
      ctx.fillStyle = hScanGrad;
      ctx.fillRect(0, scanY - 15, w, 30);

      // Drone position — scanning: circular patrol path
      let droneX = w * 0.5;
      let droneY = h * 0.35;
      const robotScale = Math.min(w, h) / 280;

      if (scanning) {
        const patrolRadius = w * 0.12;
        const patrolSpeed = 0.012;
        droneX = w * 0.5 + Math.sin(frame * patrolSpeed) * patrolRadius;
        droneY = h * 0.32 + Math.cos(frame * patrolSpeed * 0.7) * (patrolRadius * 0.4);
      }

      drawDrone(droneX, droneY, robotScale, frame, scanning);

      // Detected points during scan
      if (scanning) {
        const scanSwing = Math.sin(frame * 0.04) * 35 * robotScale;
        const groundY = droneY + 160 * robotScale;
        if (frame % 25 === 0) spawnDetection(droneX, groundY, scanSwing, w);
        drawDetectedPoints(w, h, frame);
      }

      // Left terminal panel
      ctx.save();
      const panelX = 12;
      const panelY = 16;
      const panelW = Math.min(w * 0.28, 160);
      const panelH = h - 55;

      ctx.fillStyle = 'hsla(240, 30%, 8%, 0.6)';
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeStyle = scanning ? 'hsla(160, 50%, 40%, 0.25)' : 'hsla(260, 50%, 40%, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelY, panelW, panelH);

      // Terminal text — scrolls faster when scanning, uses scanning lines
      ctx.font = '9px monospace';
      const visibleLines = Math.floor(panelH / 14);
      const lines = scanning ? scanningLines : scanLines;
      const scrollSpeed = scanning ? 0.06 : 0.02;
      const scrollOffset = Math.floor(frame * scrollSpeed) % (lines.length + 3);

      for (let i = 0; i < visibleLines && i < lines.length; i++) {
        const lineIdx = (i + scrollOffset) % lines.length;
        const alpha = 0.3 + (i / visibleLines) * 0.5;
        ctx.fillStyle = scanning
          ? `hsla(160, 90%, 60%, ${alpha})`
          : `hsla(160, 80%, 60%, ${alpha})`;
        const text = lines[lineIdx] || '';
        ctx.fillText(text.substring(0, Math.floor(panelW / 5.5)), panelX + 6, panelY + 14 + i * 14);
      }
      ctx.restore();

      // Right stats panel
      ctx.save();
      const statsX = w - panelW - 12;
      const statsY = 16;
      const statsH = scanning ? 130 : 110;

      ctx.fillStyle = 'hsla(240, 30%, 8%, 0.6)';
      ctx.fillRect(statsX, statsY, panelW, statsH);
      ctx.strokeStyle = scanning ? 'hsla(160, 50%, 40%, 0.25)' : 'hsla(260, 50%, 40%, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(statsX, statsY, panelW, statsH);

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = scanning ? 'hsla(160, 90%, 55%, 0.9)' : 'hsla(160, 80%, 60%, 0.8)';
      ctx.fillText(scanning ? '◆ SCAN ATIVO' : '◆ STATUS', statsX + 8, statsY + 16);

      ctx.font = '9px monospace';
      if (scanning) {
        ctx.fillStyle = 'hsla(160, 70%, 70%, 0.7)';
        ctx.fillText('▸ Varredura: em curso', statsX + 8, statsY + 34);
        
        const prog = scanProgressRef.current;
        ctx.fillStyle = 'hsla(160, 90%, 55%, 0.9)';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`${Math.floor(prog)}%`, statsX + 8, statsY + 58);
        
        ctx.font = '8px monospace';
        ctx.fillStyle = 'hsla(160, 40%, 60%, 0.5)';
        ctx.fillText('progresso', statsX + 8, statsY + 70);

        const detected = detectedPointsRef.current.length;
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = 'hsla(45, 90%, 60%, 0.8)';
        ctx.fillText(`${detected} sinais`, statsX + 8, statsY + 90);
        ctx.font = '8px monospace';
        ctx.fillStyle = 'hsla(45, 40%, 60%, 0.5)';
        ctx.fillText('captados', statsX + 8, statsY + 102);

        const blink = Math.sin(frame * 0.1) > 0 ? '●' : '○';
        ctx.fillStyle = 'hsla(0, 90%, 60%, 0.8)';
        ctx.font = '9px monospace';
        ctx.fillText(`${blink} ESCANEANDO`, statsX + 8, statsY + 120);
      } else {
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
      }
      ctx.restore();

      // Bottom progress bar
      ctx.save();
      const barY = h - 32;
      const barH = scanning ? 6 : 4;
      const barX = 12;
      const barW = w - 24;

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = scanning ? 'hsla(160, 60%, 55%, 0.7)' : 'hsla(260, 40%, 60%, 0.5)';
      ctx.fillText(scanning ? 'ESCANEANDO REGIÃO...' : 'PROGRESS', barX, barY - 6);

      // Bar bg
      ctx.fillStyle = 'hsla(240, 20%, 15%, 0.8)';
      ctx.fillRect(barX, barY, barW, barH);

      // Bar fill
      const progress = scanning ? scanProgressRef.current / 100 : (Math.sin(frame * 0.015) + 1) / 2;
      const barFillW = barW * progress;
      if (barFillW > 0) {
        const barGrad = ctx.createLinearGradient(barX, 0, barX + barFillW, 0);
        if (scanning) {
          barGrad.addColorStop(0, 'hsla(160, 80%, 45%, 0.95)');
          barGrad.addColorStop(1, 'hsla(160, 90%, 60%, 0.95)');
        } else {
          barGrad.addColorStop(0, 'hsla(260, 70%, 55%, 0.9)');
          barGrad.addColorStop(1, 'hsla(200, 90%, 55%, 0.9)');
        }
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX, barY, barFillW, barH);

        // Glow effect on bar tip when scanning
        if (scanning && barFillW > 2) {
          ctx.beginPath();
          ctx.arc(barX + barFillW, barY + barH / 2, 6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(160, 90%, 60%, ${0.3 + Math.sin(frame * 0.1) * 0.15})`;
          ctx.fill();
        }
      }

      // Bottom label
      ctx.font = '8px monospace';
      ctx.fillStyle = 'hsla(200, 60%, 60%, 0.4)';
      ctx.fillText(scanning ? 'Buscando empresas na região...' : 'Aguardando input de localização...', barX, barY + 16);

      // Percentage
      ctx.fillStyle = scanning ? 'hsla(160, 70%, 70%, 0.8)' : 'hsla(200, 70%, 70%, 0.6)';
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
