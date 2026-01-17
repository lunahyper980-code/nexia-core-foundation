import { Search, Globe, Sparkles, Building2, MapPin, Instagram, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatedGlobeBackground } from './AnimatedGlobeBackground';

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
    <div className="relative w-full min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* ========== LAYER 0: Globe Canvas ========== */}
      {/* Desktop: Fixed fullscreen | Mobile: Decorative, scaled, positioned at top */}
      <div 
        className="
          fixed inset-0 z-0
          md:opacity-100
          opacity-35
          md:scale-100
          scale-[0.65]
          md:translate-y-0
          -translate-y-[15%]
          md:blur-0
          blur-[2px]
        "
        style={{
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 85%)',
        }}
      >
        <AnimatedGlobeBackground />
      </div>

      {/* ========== LAYER 1: Subtle Top Gradient for Depth & Readability ========== */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, 
              rgba(0,0,0,0.5) 0%, 
              rgba(0,0,0,0.2) 15%, 
              transparent 35%, 
              transparent 75%,
              rgba(0,0,0,0.3) 100%
            )
          `
        }}
      />

      {/* ========== LAYER 2: Content - Floating HUD Style ========== */}
      <div className="relative z-10 flex flex-col h-full md:h-full min-h-full">
        
        {/* Top Section - Title & Badges */}
        <div className="pt-4 md:pt-6 lg:pt-8 px-4 md:px-8 lg:px-16">
          {/* Feature Badges - Hidden on mobile for cleaner UX */}
          <div className="hidden md:flex flex-wrap justify-center gap-4 mb-5">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/5 backdrop-blur-sm">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground/90 font-medium text-xs tracking-wide">Alcance Mundial</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/30 bg-background/10 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground/90 font-medium text-xs tracking-wide">IA Avançada</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/30 bg-background/10 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground/90 font-medium text-xs tracking-wide">Powered by Nexia</span>
            </div>
          </div>

          {/* Header - Primary focus, floating above globe */}
          <div className="text-center">
            <h1 
              className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-2 md:mb-3 tracking-tight leading-tight"
              style={{ textShadow: '0 2px 30px rgba(0,0,0,0.6)' }}
            >
              Prospectar Leads
            </h1>
            <p 
              className="text-muted-foreground/90 text-sm md:text-base lg:text-lg max-w-xl mx-auto leading-relaxed px-2"
              style={{ textShadow: '0 1px 15px rgba(0,0,0,0.5)' }}
            >
              Descubra leads qualificados em qualquer região. Nossa IA analisa o mercado e entrega contatos prontos para prospecção.
            </p>
          </div>
        </div>

        {/* Spacer - Desktop: Globe visual dominates | Mobile: Minimal */}
        <div className="flex-1 min-h-8 md:min-h-0" />

        {/* Bottom Section - Floating HUD Search Panel */}
        <div className="px-4 md:px-8 lg:px-16 pb-24 md:pb-6 lg:pb-10">
          <div className="w-full max-w-5xl mx-auto">
            <div 
              className="rounded-xl p-4 md:p-5 lg:p-6"
              style={{
                background: 'rgba(8, 8, 12, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)'
              }}
            >
              {/* Mobile: Stack inputs | Desktop: Grid layout */}
              <div className="flex flex-col gap-4 md:grid md:gap-5 lg:gap-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
                {/* Input: Nicho */}
                <div className="space-y-1.5">
                  <Label htmlFor="nicho" className="flex items-center gap-2 text-foreground/80 text-xs font-medium tracking-wide uppercase">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    Nicho / Segmento
                  </Label>
                  <Input
                    id="nicho"
                    placeholder="Ex: Barbearia, Clínica, Restaurante..."
                    value={nicho}
                    onChange={(e) => onNichoChange(e.target.value)}
                    className="bg-background/40 h-12 md:h-11 text-base md:text-sm border-border/30 focus:border-primary/40 placeholder:text-muted-foreground/50 w-full"
                  />
                </div>
                
                {/* Input: Cidade */}
                <div className="space-y-1.5">
                  <Label htmlFor="cidade" className="flex items-center gap-2 text-foreground/80 text-xs font-medium tracking-wide uppercase">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Cidade ou Região
                  </Label>
                  <Input
                    id="cidade"
                    placeholder="Ex: São Paulo, Zona Sul de SP..."
                    value={cidade}
                    onChange={(e) => onCidadeChange(e.target.value)}
                    className="bg-background/40 h-12 md:h-11 text-base md:text-sm border-border/30 focus:border-primary/40 placeholder:text-muted-foreground/50 w-full"
                  />
                </div>

                {/* Button - Full width on mobile */}
                <Button 
                  onClick={onSearch} 
                  disabled={isSearching} 
                  className="w-full md:w-auto md:min-w-[180px] gap-2 h-12 md:h-11 text-base md:text-sm font-semibold px-6 transition-all duration-200 hover:shadow-primary/25 hover:shadow-lg"
                  size="lg"
                >
                  <Search className="h-4 w-4" />
                  Iniciar Busca
                </Button>
              </div>

              {/* Filters row - Stacked on mobile */}
              <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-4 md:gap-6 lg:gap-10 mt-4 md:mt-5 pt-4 border-t border-border/15">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="possuiSite"
                    checked={possuiSite}
                    onCheckedChange={(checked) => onPossuiSiteChange(checked === true)}
                    className="border-border/40 h-5 w-5 md:h-4 md:w-4"
                  />
                  <Label htmlFor="possuiSite" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground/80 text-sm hover:text-foreground/90 transition-colors">
                    <Globe className="h-3.5 w-3.5 text-emerald-500/80" />
                    Possui site
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="possuiInstagram"
                    checked={possuiInstagram}
                    onCheckedChange={(checked) => onPossuiInstagramChange(checked === true)}
                    className="border-border/40 h-5 w-5 md:h-4 md:w-4"
                  />
                  <Label htmlFor="possuiInstagram" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground/80 text-sm hover:text-foreground/90 transition-colors">
                    <Instagram className="h-3.5 w-3.5 text-pink-500/80" />
                    Possui Instagram
                  </Label>
                </div>
                
                {/* Tagline - Hidden on mobile */}
                <p className="hidden md:block text-[11px] text-muted-foreground/50 ml-auto tracking-wide">
                  Prospecção inteligente com a tecnologia Nexia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
