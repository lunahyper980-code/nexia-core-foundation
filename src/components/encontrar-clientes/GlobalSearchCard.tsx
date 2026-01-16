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
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
      {/* ========== LAYER 0: Globe Canvas - Fullscreen Background ========== */}
      <div className="fixed inset-0 z-0">
        <AnimatedGlobeBackground />
      </div>

      {/* ========== LAYER 1: Dark Gradient Overlay for Readability ========== */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)
          `
        }}
      />

      {/* ========== LAYER 2: Content - Floating HUD Style ========== */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Top Section - Title & Badges */}
        <div className="pt-8 lg:pt-12 px-6 lg:px-12">
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-md shadow-lg">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium text-sm">Alcance Mundial</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/20 backdrop-blur-md shadow-lg">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium text-sm">IA Avançada</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/20 backdrop-blur-md shadow-lg">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium text-sm">Powered by Nexia</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              Prospectar Leads
            </h1>
            <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto"
               style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Descubra leads qualificados em qualquer região. Nossa IA analisa o mercado e entrega contatos prontos para prospecção.
            </p>
          </div>
        </div>

        {/* Spacer - Globe visual dominates this area */}
        <div className="flex-1" />

        {/* Bottom Section - Floating HUD Search Panel */}
        <div className="px-6 lg:px-12 pb-8 lg:pb-12">
          <div className="w-full max-w-5xl mx-auto">
            <div 
              className="rounded-2xl border border-border/30 p-6 lg:p-8 shadow-2xl"
              style={{
                background: 'rgba(10, 10, 15, 0.75)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr_auto]">
                {/* Input: Nicho */}
                <div className="space-y-2">
                  <Label htmlFor="nicho" className="flex items-center gap-2 text-foreground text-sm font-medium">
                    <Building2 className="h-4 w-4 text-primary" />
                    Nicho / Segmento
                  </Label>
                  <Input
                    id="nicho"
                    placeholder="Ex: Barbearia, Clínica, Restaurante..."
                    value={nicho}
                    onChange={(e) => onNichoChange(e.target.value)}
                    className="bg-background/50 h-12 text-base border-border/40 focus:border-primary/50"
                  />
                </div>
                
                {/* Input: Cidade */}
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="flex items-center gap-2 text-foreground text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    Cidade ou Região
                  </Label>
                  <Input
                    id="cidade"
                    placeholder="Ex: São Paulo, Zona Sul de SP..."
                    value={cidade}
                    onChange={(e) => onCidadeChange(e.target.value)}
                    className="bg-background/50 h-12 text-base border-border/40 focus:border-primary/50"
                  />
                </div>

                {/* Button */}
                <div className="flex items-end">
                  <Button 
                    onClick={onSearch} 
                    disabled={isSearching} 
                    className="w-full lg:w-auto lg:min-w-[200px] gap-2 h-12 text-base font-semibold px-8 shadow-lg shadow-primary/20"
                    size="lg"
                  >
                    <Search className="h-5 w-5" />
                    Iniciar Busca
                  </Button>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-8 mt-6 pt-6 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="possuiSite"
                    checked={possuiSite}
                    onCheckedChange={(checked) => onPossuiSiteChange(checked === true)}
                  />
                  <Label htmlFor="possuiSite" className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
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
                  <Label htmlFor="possuiInstagram" className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <Instagram className="h-4 w-4 text-pink-500" />
                    Possui Instagram
                  </Label>
                </div>
                
                {/* Tagline */}
                <p className="text-xs text-muted-foreground ml-auto opacity-70">
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
