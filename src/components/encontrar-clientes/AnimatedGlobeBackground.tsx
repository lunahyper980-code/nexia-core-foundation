import { useEffect, useRef } from 'react';

export function AnimatedGlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Globe parameters - MASSIVE globe that dominates the viewport
    const globeRadius = Math.min(width, height) * 0.55;
    const numPoints = 2000;
    const points: { phi: number; theta: number; size: number }[] = [];
    const connections: { from: number; to: number }[] = [];

    // Generate points on sphere
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      points.push({
        phi,
        theta,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    // Generate connections
    for (let i = 0; i < 150; i++) {
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
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Calculate rotation based on mouse
      const targetRotationY = ((mouseX - width / 2) / width) * 0.5;
      const targetRotationX = ((mouseY - height / 2) / height) * 0.3;

      rotationY += (targetRotationY - rotationY) * 0.02;
      rotationX += (targetRotationX - rotationX) * 0.02;

      // Auto rotation
      const autoRotation = Date.now() * 0.0001;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw outer glow
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        globeRadius * 1.5
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
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

      // Draw connections first (back to front)
      ctx.lineWidth = 0.5;
      for (const conn of connections) {
        const p1 = projectedPoints.find((p) => p.index === conn.from);
        const p2 = projectedPoints.find((p) => p.index === conn.to);

        if (p1 && p2 && p1.z > -0.3 && p2.z > -0.3) {
          const dist = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
          );

          if (dist < globeRadius * 0.4) {
            const opacity = Math.min(p1.z + 0.5, p2.z + 0.5) * 0.3 * (1 - dist / (globeRadius * 0.4));
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${Math.max(0, opacity)})`;
            ctx.stroke();
          }
        }
      }

      // Draw points
      for (const point of projectedPoints) {
        if (point.z > -0.5) {
          const opacity = (point.z + 1) / 2;
          const size = point.size * (0.5 + opacity * 0.5);

          // Glow
          ctx.beginPath();
          ctx.arc(point.x, point.y, size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, ${opacity * 0.1})`;
          ctx.fill();

          // Point
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${opacity * 0.8})`;
          ctx.fill();
        }
      }

      // Draw latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
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
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw longitude lines
      for (let lon = 0; lon < 360; lon += 30) {
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
        const opacity = 0.05 + Math.abs(Math.sin(lonRad)) * 0.05;
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Inner glow highlight
      const innerGlow = ctx.createRadialGradient(
        centerX - globeRadius * 0.3,
        centerY - globeRadius * 0.3,
        0,
        centerX,
        centerY,
        globeRadius
      );
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      innerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ cursor: 'crosshair' }}
    />
  );
}
