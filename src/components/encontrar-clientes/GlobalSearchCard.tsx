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
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      {/* Fullscreen Animated Globe Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedGlobeBackground />
      </div>

      {/* Content Layer - Above the globe */}
      <div className="relative z-10 flex flex-col h-full pt-8 lg:pt-12 px-4 lg:px-8">
        {/* Feature Badges - Top aligned */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium text-sm">Alcance Mundial</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/30 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium text-sm">IA Avançada</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/30 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium text-sm">Powered by Nexia</span>
          </div>
        </div>

        {/* Header Section - Top aligned */}
        <div className="text-center mb-4">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 drop-shadow-lg">
            Prospectar Leads
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg max-w-2xl mx-auto drop-shadow-md">
            Descubra leads qualificados em qualquer região. Nossa IA analisa o mercado e entrega contatos prontos para prospecção.
          </p>
        </div>

        {/* Spacer - Globe occupies this visual space */}
        <div className="flex-1 min-h-[200px] lg:min-h-[280px]" />

        {/* Search Form - Bottom of hero, full width desktop style */}
        <div className="w-full max-w-5xl mx-auto mt-auto pb-8">
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-6 lg:p-8 shadow-2xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr_auto]">
              {/* Inputs container */}
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
                  className="bg-background/70 h-12 text-base border-border/50"
                />
              </div>
              
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
                  className="bg-background/70 h-12 text-base border-border/50"
                />
              </div>

              {/* Button - Desktop aligned */}
              <div className="flex items-end">
                <Button 
                  onClick={onSearch} 
                  disabled={isSearching} 
                  className="w-full lg:w-auto lg:min-w-[200px] gap-2 h-12 text-base font-semibold px-8"
                  size="lg"
                >
                  <Search className="h-5 w-5" />
                  Iniciar Busca
                </Button>
              </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-8 mt-6 pt-6 border-t border-border/30">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="possuiSite"
                  checked={possuiSite}
                  onCheckedChange={(checked) => onPossuiSiteChange(checked === true)}
                />
                <Label htmlFor="possuiSite" className="flex items-center gap-2 cursor-pointer text-muted-foreground">
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
                <Label htmlFor="possuiInstagram" className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Possui Instagram
                </Label>
              </div>
              
              {/* Tagline */}
              <p className="text-xs text-muted-foreground ml-auto">
                Prospecção inteligente com a tecnologia Nexia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
