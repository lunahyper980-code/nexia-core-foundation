import { useEffect, useRef } from 'react';
import { useSidebarState } from '@/contexts/SidebarContext';
import { useBreakpoint } from '@/hooks/use-breakpoint';

export function AnimatedGlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { collapsed } = useSidebarState();
  const breakpoint = useBreakpoint();

  // Calculate sidebar width based on state
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const sidebarWidth = isMobile ? 0 : (isTablet || collapsed) ? 64 : 256;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Globe parameters - REFINED: smaller, more elegant globe
    // Size: ~55-60% of available content height for balanced proportions
    const availableHeight = height * 0.55;
    const availableContentWidth = width - sidebarWidth;
    const globeRadius = Math.min(availableContentWidth * 0.35, availableHeight * 0.5);
    
    const numPoints = 1200; // Reduced for cleaner look
    const points: { phi: number; theta: number; size: number }[] = [];
    const connections: { from: number; to: number }[] = [];

    // Generate points on sphere
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      points.push({
        phi,
        theta,
        size: Math.random() * 1.2 + 0.4,
      });
    }

    // Generate connections - fewer for cleaner look
    for (let i = 0; i < 100; i++) {
      const from = Math.floor(Math.random() * numPoints);
      const to = Math.floor(Math.random() * numPoints);
      if (from !== to) {
        connections.push({ from, to });
      }
    }

    let rotationY = 0;
    let rotationX = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse following
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      // Calculate rotation based on mouse - reduced sensitivity
      const targetRotationY = ((mouseX - width / 2) / width) * 0.3;
      const targetRotationX = ((mouseY - height / 2) / height) * 0.2;

      rotationY += (targetRotationY - rotationY) * 0.015;
      rotationX += (targetRotationX - rotationX) * 0.015;

      // Auto rotation - SLOWER: reduced by ~40% for premium feel
      const autoRotation = Date.now() * 0.00006;

      // SIDEBAR-AWARE CENTER: Calculate center considering sidebar offset
      const contentWidth = width - sidebarWidth;
      const centerX = sidebarWidth + (contentWidth / 2);
      // Globe positioned slightly ABOVE center for hero visual feel
      const centerY = height * 0.45;

      // === COLOR PALETTE: More neutral, less purple, technical feel ===
      // Primary: Cool gray-blue (desaturated, technical)
      const primaryR = 140;
      const primaryG = 150;
      const primaryB = 180;
      
      // Accent: Very subtle purple-gray
      const accentR = 160;
      const accentG = 155;
      const accentB = 190;
      
      // Highlight: Soft white-blue
      const highlightR = 200;
      const highlightG = 210;
      const highlightB = 230;

      // Draw subtle outer glow - very muted
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        globeRadius * 1.4
      );
      gradient.addColorStop(0, `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.04)`);
      gradient.addColorStop(0.6, `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.015)`);
      gradient.addColorStop(1, `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw globe outline - subtle
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.12)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Calculate 3D positions and sort by depth
      const projectedPoints: {
        x: number;
        y: number;
        z: number;
        size: number;
        index: number;
      }[] = [];

      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        // Spherical to cartesian
        let x = Math.sin(point.phi) * Math.cos(point.theta + autoRotation + rotationY);
        let y = Math.cos(point.phi);
        let z = Math.sin(point.phi) * Math.sin(point.theta + autoRotation + rotationY);

        // Apply X rotation
        const tempY = y;
        y = y * Math.cos(rotationX) - z * Math.sin(rotationX);
        z = tempY * Math.sin(rotationX) + z * Math.cos(rotationX);

        projectedPoints.push({
          x: centerX + x * globeRadius,
          y: centerY + y * globeRadius,
          z,
          size: point.size,
          index: i,
        });
      }

      // Sort by Z (depth) for proper rendering
      projectedPoints.sort((a, b) => a.z - b.z);

      // Draw connections first (back to front) - more subtle
      ctx.lineWidth = 0.4;
      for (const conn of connections) {
        const p1 = projectedPoints.find((p) => p.index === conn.from);
        const p2 = projectedPoints.find((p) => p.index === conn.to);

        if (p1 && p2 && p1.z > -0.3 && p2.z > -0.3) {
          const dist = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
          );

          if (dist < globeRadius * 0.35) {
            const opacity = Math.min(p1.z + 0.5, p2.z + 0.5) * 0.2 * (1 - dist / (globeRadius * 0.35));
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${accentR}, ${accentG}, ${accentB}, ${Math.max(0, opacity)})`;
            ctx.stroke();
          }
        }
      }

      // Draw points - neutral colors with subtle accent
      for (const point of projectedPoints) {
        if (point.z > -0.5) {
          const opacity = (point.z + 1) / 2;
          const size = point.size * (0.4 + opacity * 0.4);

          // Subtle glow - very reduced
          ctx.beginPath();
          ctx.arc(point.x, point.y, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, ${opacity * 0.06})`;
          ctx.fill();

          // Point - more white/neutral
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${highlightR}, ${highlightG}, ${highlightB}, ${opacity * 0.7})`;
          ctx.fill();
        }
      }

      // Draw latitude lines - very subtle
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const r = Math.cos(latRad) * globeRadius;
        const yOffset = Math.sin(latRad) * globeRadius;

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY + yOffset * Math.cos(rotationX),
          r,
          r * Math.abs(Math.sin(rotationX)) * 0.3 + r * 0.1,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, 0.05)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw longitude lines - very subtle
      for (let lon = 0; lon < 360; lon += 45) {
        const lonRad = ((lon + autoRotation * 57.3 + rotationY * 57.3) * Math.PI) / 180;

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(Math.cos(lonRad)) * globeRadius,
          globeRadius,
          0,
          0,
          Math.PI * 2
        );
        const opacity = 0.03 + Math.abs(Math.sin(lonRad)) * 0.03;
        ctx.strokeStyle = `rgba(${primaryR}, ${primaryG}, ${primaryB}, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Inner glow highlight - soft white, elegant
      const innerGlow = ctx.createRadialGradient(
        centerX - globeRadius * 0.25,
        centerY - globeRadius * 0.25,
        0,
        centerX,
        centerY,
        globeRadius
      );
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      innerGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.015)');
      innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sidebarWidth]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ cursor: 'crosshair' }}
    />
  );
}
