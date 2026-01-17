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
  onSearchingChange?: (isSearching: boolean) => void;
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
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
      {/* ========== LAYER 0: Globe Canvas - Fullscreen Background ========== */}
      <div className="fixed inset-0 z-0">
        <AnimatedGlobeBackground isSearching={isSearching} />
      </div>

      {/* ========== LAYER 1: Subtle Top Gradient for Depth & Readability ========== */}
      <div 
        className={`fixed inset-0 z-[1] pointer-events-none transition-opacity duration-500 ${
          isSearching ? 'opacity-0' : 'opacity-100'
        }`}
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

      {/* ========== LAYER 2: Content - Stagger animation when searching ========== */}
      <div 
        className={`relative z-10 flex flex-col h-full ${
          isSearching ? 'pointer-events-none' : ''
        }`}
      >
        
        {/* Top Section - Title & Badges */}
        <div className="pt-6 lg:pt-8 px-8 lg:px-16">
          {/* Feature Badges - Stagger delay 0ms */}
          <div 
            className={`flex flex-wrap justify-center gap-4 mb-5 transition-all duration-500 ease-out ${
              isSearching 
                ? 'opacity-0 -translate-y-8 scale-90' 
                : 'opacity-100 translate-y-0 scale-100'
            }`}
            style={{ transitionDelay: isSearching ? '0ms' : '300ms' }}
          >
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

          {/* Header - Stagger delay 80ms */}
          <div 
            className={`text-center transition-all duration-500 ease-out ${
              isSearching 
                ? 'opacity-0 -translate-y-6 scale-95' 
                : 'opacity-100 translate-y-0 scale-100'
            }`}
            style={{ transitionDelay: isSearching ? '80ms' : '220ms' }}
          >
            <h1 
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 tracking-tight"
              style={{ textShadow: '0 2px 30px rgba(0,0,0,0.6)' }}
            >
              Prospectar Leads
            </h1>
            <p 
              className="text-muted-foreground/90 text-base lg:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ textShadow: '0 1px 15px rgba(0,0,0,0.5)' }}
            >
              Descubra leads qualificados em qualquer região. Nossa IA analisa o mercado e entrega contatos prontos para prospecção.
            </p>
          </div>
        </div>

        {/* Spacer - Globe visual dominates this area */}
        <div className="flex-1" />

        {/* Bottom Section - Floating HUD Search Panel - Stagger delay 160ms */}
        <div 
          className={`px-8 lg:px-16 pb-6 lg:pb-10 transition-all duration-600 ease-out ${
            isSearching 
              ? 'opacity-0 translate-y-12 scale-90' 
              : 'opacity-100 translate-y-0 scale-100'
          }`}
          style={{ transitionDelay: isSearching ? '160ms' : '100ms' }}
        >
          <div className="w-full max-w-5xl mx-auto">
            <div 
              className="rounded-xl p-5 lg:p-6"
              style={{
                background: 'rgba(8, 8, 12, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)'
              }}
            >
              <div className="grid gap-5 lg:gap-6 lg:grid-cols-[1fr_1fr_auto] items-end">
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
                    className="bg-background/40 h-11 text-sm border-border/30 focus:border-primary/40 placeholder:text-muted-foreground/50"
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
                    className="bg-background/40 h-11 text-sm border-border/30 focus:border-primary/40 placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Button */}
                <Button 
                  onClick={onSearch} 
                  disabled={isSearching} 
                  className="w-full lg:w-auto lg:min-w-[180px] gap-2 h-11 text-sm font-semibold px-6 transition-all duration-200 hover:shadow-primary/25 hover:shadow-lg"
                  size="lg"
                >
                  <Search className="h-4 w-4" />
                  Iniciar Busca
                </Button>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-6 lg:gap-10 mt-5 pt-4 border-t border-border/15">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="possuiSite"
                    checked={possuiSite}
                    onCheckedChange={(checked) => onPossuiSiteChange(checked === true)}
                    className="border-border/40"
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
                    className="border-border/40"
                  />
                  <Label htmlFor="possuiInstagram" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground/80 text-sm hover:text-foreground/90 transition-colors">
                    <Instagram className="h-3.5 w-3.5 text-pink-500/80" />
                    Possui Instagram
                  </Label>
                </div>
                
                {/* Tagline */}
                <p className="text-[11px] text-muted-foreground/50 ml-auto tracking-wide">
                  Prospecção inteligente com a tecnologia Nexia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== LAYER 3: Search Loading - Unified container with globe ========== */}
      <div 
        className={`fixed inset-0 z-20 pointer-events-none flex items-center justify-center transition-all duration-700 ${
          isSearching ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Single unified container - globe area + text + bar as one unit */}
        <div className="flex flex-col items-center justify-center w-full h-full">
          {/* Spacer to position content below globe visual center (globe is at 52% height) */}
          <div className="flex-1" style={{ minHeight: '58%' }} />
          
          {/* Text + Bar container - immediately below globe */}
          <div className="flex flex-col items-center gap-3 px-6 pb-8">
            {/* Status text - elegant, secondary hierarchy */}
            <p 
              className="text-foreground/80 text-xs sm:text-sm font-light tracking-widest text-center uppercase"
              style={{ 
                textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 30px rgba(139, 92, 246, 0.15)',
                animation: 'breathe-text 3.5s ease-in-out infinite',
                letterSpacing: '0.12em'
              }}
            >
              Encontrando oportunidades na sua região…
            </p>
            
            {/* Minimal progress bar - discrete, short, support visual */}
            <div className="w-32 sm:w-40 h-[2px] bg-muted/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)',
                  animation: 'indeterminate-progress 2.2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
          
          {/* Bottom spacer */}
          <div className="h-12 sm:h-16" />
        </div>
      </div>

      <style>{`
        @keyframes indeterminate-progress {
          0% {
            width: 0%;
            margin-left: 0%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          50% {
            width: 60%;
            margin-left: 20%;
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            width: 0%;
            margin-left: 100%;
            opacity: 0;
          }
        }
        @keyframes breathe-text {
          0%, 100% {
            opacity: 0.55;
          }
          50% {
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );
}
