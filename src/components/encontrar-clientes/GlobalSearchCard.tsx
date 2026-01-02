import { useEffect, useRef } from 'react';
import { Search, Globe, Sparkles, Brain, Building2, MapPin, Instagram, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface GlobalSearchCardProps {
  nicho: string;
  cidade: string;
  possuiSite: boolean;
  possuiInstagram: boolean;
  isSearching: boolean;
  onNichoChange: (value: string) => void;
  onCidadeChange: (value: string) => void;
  onPossuiSiteChange: (value: boolean) => void;
  onPossuiInstagramChange: (value: boolean) => void;
  onSearch: () => void;
}

// Animated tech sphere canvas component - realistic 3D effect
function TechSphereVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 320;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const sphereRadius = size / 2 - 30;

    let animationId: number;
    let time = 0;

    // Colors
    const primaryColor = { r: 139, g: 92, b: 246 };
    const glowColor = { r: 167, g: 139, b: 250 };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      time += 0.008;

      // Draw outer glow
      const outerGlow = ctx.createRadialGradient(centerX, centerY, sphereRadius * 0.5, centerX, centerY, sphereRadius * 1.3);
      outerGlow.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0)`);
      outerGlow.addColorStop(0.7, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.05)`);
      outerGlow.addColorStop(1, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0)`);
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, size, size);

      // Draw sphere base with gradient
      const sphereGradient = ctx.createRadialGradient(
        centerX - sphereRadius * 0.3, 
        centerY - sphereRadius * 0.3, 
        0, 
        centerX, 
        centerY, 
        sphereRadius
      );
      sphereGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      sphereGradient.addColorStop(0.3, 'rgba(200, 200, 220, 0.1)');
      sphereGradient.addColorStop(0.7, 'rgba(100, 100, 130, 0.08)');
      sphereGradient.addColorStop(1, 'rgba(50, 50, 80, 0.05)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGradient;
      ctx.fill();

      // Draw longitude lines (rotating)
      const numLongitudes = 12;
      for (let i = 0; i < numLongitudes; i++) {
        const angle = (i / numLongitudes) * Math.PI + time;
        const x1 = centerX + Math.cos(angle) * sphereRadius;
        const x2 = centerX - Math.cos(angle) * sphereRadius;
        
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(Math.cos(angle)) * sphereRadius,
          sphereRadius,
          0,
          0,
          Math.PI * 2
        );
        const opacity = 0.15 + Math.abs(Math.sin(angle)) * 0.15;
        ctx.strokeStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw latitude lines
      const numLatitudes = 8;
      for (let i = 1; i < numLatitudes; i++) {
        const y = centerY + (i - numLatitudes / 2) * (sphereRadius * 2 / numLatitudes);
        const latRadius = Math.sqrt(sphereRadius * sphereRadius - Math.pow(y - centerY, 2));
        
        if (latRadius > 0) {
          ctx.beginPath();
          ctx.ellipse(centerX, y, latRadius, latRadius * 0.2, 0, 0, Math.PI * 2);
          const distFromCenter = Math.abs(y - centerY) / sphereRadius;
          const opacity = 0.1 + (1 - distFromCenter) * 0.15;
          ctx.strokeStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw dots on the sphere (like world map points)
      const dots = [
        // Americas
        { lat: 0.3, lon: -0.8, size: 3 },
        { lat: 0.1, lon: -0.75, size: 2 },
        { lat: -0.2, lon: -0.7, size: 2.5 },
        { lat: -0.5, lon: -0.65, size: 2 },
        { lat: 0.5, lon: -0.9, size: 2 },
        // Europe
        { lat: 0.55, lon: 0.1, size: 2.5 },
        { lat: 0.45, lon: 0.2, size: 2 },
        { lat: 0.5, lon: 0.0, size: 2 },
        // Africa
        { lat: 0.1, lon: 0.15, size: 2 },
        { lat: -0.2, lon: 0.2, size: 2.5 },
        // Asia
        { lat: 0.5, lon: 0.6, size: 3 },
        { lat: 0.4, lon: 0.8, size: 2 },
        { lat: 0.3, lon: 0.7, size: 2.5 },
        { lat: 0.2, lon: 0.9, size: 2 },
        // Oceania
        { lat: -0.4, lon: 0.9, size: 2 },
      ];

      dots.forEach((dot, i) => {
        const rotatedLon = dot.lon + time * 0.5;
        const x3d = Math.cos(dot.lat * Math.PI / 2) * Math.sin(rotatedLon * Math.PI);
        const y3d = Math.sin(dot.lat * Math.PI / 2);
        const z3d = Math.cos(dot.lat * Math.PI / 2) * Math.cos(rotatedLon * Math.PI);

        // Only draw if visible (front side)
        if (z3d > -0.2) {
          const x = centerX + x3d * sphereRadius * 0.85;
          const y = centerY - y3d * sphereRadius * 0.85;
          const opacity = 0.3 + z3d * 0.7;
          const pulse = Math.sin(time * 3 + i) * 0.3 + 0.7;

          // Dot glow
          ctx.beginPath();
          ctx.arc(x, y, dot.size * 2 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${opacity * 0.2})`;
          ctx.fill();

          // Dot
          ctx.beginPath();
          ctx.arc(x, y, dot.size * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${opacity})`;
          ctx.fill();
        }
      });

      // Draw connections between nearby visible dots
      dots.forEach((dot1, i) => {
        dots.forEach((dot2, j) => {
          if (i >= j) return;
          
          const rotatedLon1 = dot1.lon + time * 0.5;
          const rotatedLon2 = dot2.lon + time * 0.5;
          
          const x1_3d = Math.cos(dot1.lat * Math.PI / 2) * Math.sin(rotatedLon1 * Math.PI);
          const y1_3d = Math.sin(dot1.lat * Math.PI / 2);
          const z1_3d = Math.cos(dot1.lat * Math.PI / 2) * Math.cos(rotatedLon1 * Math.PI);
          
          const x2_3d = Math.cos(dot2.lat * Math.PI / 2) * Math.sin(rotatedLon2 * Math.PI);
          const y2_3d = Math.sin(dot2.lat * Math.PI / 2);
          const z2_3d = Math.cos(dot2.lat * Math.PI / 2) * Math.cos(rotatedLon2 * Math.PI);

          const dist = Math.sqrt(
            Math.pow(x1_3d - x2_3d, 2) + 
            Math.pow(y1_3d - y2_3d, 2) + 
            Math.pow(z1_3d - z2_3d, 2)
          );

          if (dist < 0.6 && z1_3d > 0 && z2_3d > 0) {
            const x1 = centerX + x1_3d * sphereRadius * 0.85;
            const y1 = centerY - y1_3d * sphereRadius * 0.85;
            const x2 = centerX + x2_3d * sphereRadius * 0.85;
            const y2 = centerY - y2_3d * sphereRadius * 0.85;
            
            const opacity = (1 - dist / 0.6) * Math.min(z1_3d, z2_3d) * 0.4;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Inner highlight
      const innerHighlight = ctx.createRadialGradient(
        centerX - sphereRadius * 0.4,
        centerY - sphereRadius * 0.4,
        0,
        centerX - sphereRadius * 0.4,
        centerY - sphereRadius * 0.4,
        sphereRadius * 0.6
      );
      innerHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      innerHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = innerHighlight;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bottom shadow/fade
      const bottomFade = ctx.createLinearGradient(centerX, centerY + sphereRadius * 0.5, centerX, centerY + sphereRadius * 1.2);
      bottomFade.addColorStop(0, 'rgba(0, 0, 0, 0)');
      bottomFade.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = bottomFade;
      ctx.fillRect(0, centerY + sphereRadius * 0.5, size, size);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Outer rotating ring */}
      <div 
        className="absolute inset-[-12px] border border-dashed border-primary/15 rounded-full"
        style={{ animation: 'spin 40s linear infinite' }}
      />
      <div 
        className="absolute inset-[-6px] border border-primary/10 rounded-full"
        style={{ animation: 'spin 30s linear infinite reverse' }}
      />
      
      {/* Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Outer glow */}
      <div className="absolute inset-[-16px] rounded-full bg-primary/5 blur-xl -z-10" />
    </div>
  );
}

export function GlobalSearchCard({
  nicho,
  cidade,
  possuiSite,
  possuiInstagram,
  isSearching,
  onNichoChange,
  onCidadeChange,
  onPossuiSiteChange,
  onPossuiInstagramChange,
  onSearch,
}: GlobalSearchCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-primary/5 border border-border/50 shadow-xl">
      {/* Background glow effects */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 p-8 md:p-12">
        {/* Feature Badges - Above title */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium">Alcance Mundial</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background/50 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium">IA Avançada</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background/50 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium">Powered by Nexia</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Prospectar Leads
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Descubra leads qualificados em qualquer região. Nossa IA analisa o mercado e entrega contatos prontos para prospecção.
          </p>
        </div>

        {/* Tech Sphere Visual */}
        <div className="relative flex justify-center mb-10">
          <TechSphereVisual />
        </div>

        {/* Search Form */}
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 md:p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nicho" className="flex items-center gap-2 text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                Nicho / Segmento
              </Label>
              <Input
                id="nicho"
                placeholder="Ex: Barbearia, Clínica, Restaurante..."
                value={nicho}
                onChange={(e) => onNichoChange(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade" className="flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Cidade ou Região
              </Label>
              <Input
                id="cidade"
                placeholder="Ex: São Paulo, Zona Sul de SP..."
                value={cidade}
                onChange={(e) => onCidadeChange(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="possuiSite"
                checked={possuiSite}
                onCheckedChange={(checked) => onPossuiSiteChange(checked === true)}
              />
              <Label htmlFor="possuiSite" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                <Globe className="h-4 w-4 text-emerald-500" />
                Possui site
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="possuiInstagram"
                checked={possuiInstagram}
                onCheckedChange={(checked) => onPossuiInstagramChange(checked === true)}
              />
              <Label htmlFor="possuiInstagram" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                <Instagram className="h-4 w-4 text-pink-500" />
                Possui Instagram
              </Label>
            </div>
          </div>

          <Button 
            onClick={onSearch} 
            disabled={isSearching} 
            className="w-full gap-2 h-12 text-base font-semibold"
            size="lg"
          >
            <Search className="h-5 w-5" />
            Iniciar Busca
          </Button>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Prospecção inteligente com a tecnologia Nexia
        </p>
      </div>
    </div>
  );
}
