import { Search, Globe, Sparkles, Building2, MapPin, Instagram, Zap, Scissors, Heart, Stethoscope, UtensilsCrossed, Dumbbell, Home, Scale, Calculator, Store, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatedGlobeBackground } from './AnimatedGlobeBackground';
import { cn } from '@/lib/utils';

const QUICK_NICHES = [
  { label: 'Barbearia', icon: Scissors },
  { label: 'Salão de beleza', icon: Heart },
  { label: 'Clínica / Consultório', icon: Stethoscope },
  { label: 'Restaurante / Delivery', icon: UtensilsCrossed },
  { label: 'Academia / Personal', icon: Dumbbell },
  { label: 'Imobiliária', icon: Home },
  { label: 'Advogado', icon: Scale },
  { label: 'Contador', icon: Calculator },
  { label: 'Loja local', icon: Store },
  { label: 'Prestador de serviços', icon: Wrench },
];

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
  const handleNichoSelect = (label: string) => {
    // Toggle: if already selected, clear it; otherwise set it
    if (nicho === label) {
      onNichoChange('');
    } else {
      onNichoChange(label);
    }
  };
  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* ========== LAYER 0: Globe Canvas - Fullscreen Background ========== */}
      <div className="fixed inset-0 z-0">
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
      {/* MOBILE: flex-col with natural flow | DESKTOP: flex with spacer */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Top Section - Title & Badges */}
        <div className="pt-4 md:pt-6 lg:pt-8 px-4 md:px-8 lg:px-16">
          {/* Feature Badges - Lighter, more subtle */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-3 md:mb-5">
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-primary/25 bg-primary/5 backdrop-blur-sm">
              <Globe className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" />
              <span className="text-foreground/90 font-medium text-[10px] md:text-xs tracking-wide">Alcance Mundial</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-border/30 bg-background/10 backdrop-blur-sm">
              <Zap className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" />
              <span className="text-foreground/90 font-medium text-[10px] md:text-xs tracking-wide">IA Avançada</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-border/30 bg-background/10 backdrop-blur-sm">
              <Sparkles className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" />
              <span className="text-foreground/90 font-medium text-[10px] md:text-xs tracking-wide">Powered by Nexia</span>
            </div>
          </div>

          {/* Header - Primary focus */}
          <div className="text-center">
            <h1 
              className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-2 md:mb-3 tracking-tight"
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

        {/* MOBILE: Fixed height spacer for globe | DESKTOP: flex-1 spacer */}
        <div className="h-[180px] md:flex-1" />

        {/* Bottom Section - Floating HUD Search Panel */}
        <div className="px-4 md:px-8 lg:px-16 pb-4 md:pb-6 lg:pb-10">
          <div className="w-full max-w-5xl mx-auto">
            <div 
              className="rounded-xl p-4 md:p-5 lg:p-6"
              style={{
                background: 'rgba(8, 8, 12, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)'
              }}
            >
              {/* Quick Niche Selection Chips */}
              <div className="mb-4 md:mb-5">
                <Label className="flex items-center gap-2 text-foreground/80 text-[11px] md:text-xs font-medium tracking-wide uppercase mb-2.5">
                  <Building2 className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" />
                  Seleção Rápida de Nicho
                </Label>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {QUICK_NICHES.map(({ label, icon: Icon }) => {
                    const isActive = nicho === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleNichoSelect(label)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-medium transition-all duration-200",
                          "border backdrop-blur-sm",
                          isActive
                            ? "bg-primary/20 border-primary/50 text-primary shadow-sm shadow-primary/20"
                            : "bg-background/20 border-border/30 text-muted-foreground/80 hover:bg-background/40 hover:border-border/50 hover:text-foreground/90"
                        )}
                      >
                        <Icon className={cn("h-3 w-3", isActive ? "text-primary" : "text-muted-foreground/70")} />
                        <span className="whitespace-nowrap">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:gap-5 lg:gap-6 lg:grid-cols-[1fr_1fr_auto] items-end">
                {/* Input: Nicho */}
                <div className="space-y-1.5">
                  <Label htmlFor="nicho" className="flex items-center gap-2 text-foreground/80 text-[11px] md:text-xs font-medium tracking-wide uppercase">
                    <Building2 className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" />
                    Nicho / Segmento
                  </Label>
                  <Input
                    id="nicho"
                    placeholder="Ou digite um nicho personalizado..."
                    value={nicho}
                    onChange={(e) => onNichoChange(e.target.value)}
                    className="bg-background/40 h-10 md:h-11 text-sm border-border/30 focus:border-primary/40 placeholder:text-muted-foreground/50"
                  />
                </div>
                
                {/* Input: Cidade */}
                <div className="space-y-1.5">
                  <Label htmlFor="cidade" className="flex items-center gap-2 text-foreground/80 text-[11px] md:text-xs font-medium tracking-wide uppercase">
                    <MapPin className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" />
                    Cidade ou Região
                  </Label>
                  <Input
                    id="cidade"
                    placeholder="Ex: São Paulo, Zona Sul de SP..."
                    value={cidade}
                    onChange={(e) => onCidadeChange(e.target.value)}
                    className="bg-background/40 h-10 md:h-11 text-sm border-border/30 focus:border-primary/40 placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Button */}
                <Button 
                  onClick={onSearch} 
                  disabled={isSearching} 
                  className="w-full lg:w-auto lg:min-w-[180px] gap-2 h-10 md:h-11 text-sm font-semibold px-6 transition-all duration-200 hover:shadow-primary/25 hover:shadow-lg"
                  size="lg"
                >
                  <Search className="h-4 w-4" />
                  Iniciar Busca
                </Button>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-10 mt-4 md:mt-5 pt-3 md:pt-4 border-t border-border/15">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="possuiSite"
                    checked={possuiSite}
                    onCheckedChange={(checked) => onPossuiSiteChange(checked === true)}
                    className="border-border/40"
                  />
                  <Label htmlFor="possuiSite" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground/80 text-xs md:text-sm hover:text-foreground/90 transition-colors">
                    <Globe className="h-3 md:h-3.5 w-3 md:w-3.5 text-emerald-500/80" />
                    Possui site
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="possuiInstagram"
                    checked={possuiInstagram}
                    onCheckedChange={(checked) => onPossuiInstagramChange(checked === true)}
                    className="border-border/40"
                  />
                  <Label htmlFor="possuiInstagram" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground/80 text-xs md:text-sm hover:text-foreground/90 transition-colors">
                    <Instagram className="h-3 md:h-3.5 w-3 md:w-3.5 text-pink-500/80" />
                    Possui Instagram
                  </Label>
                </div>
                
                {/* Tagline - Hidden on mobile for cleaner look */}
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
