import { Globe, Zap, Sparkles, Building2, MapPin, Instagram, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PremiumGlobeCanvas } from './PremiumGlobeCanvas';

interface ProspectorSearchScreenProps {
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

export function ProspectorSearchScreen({
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
}: ProspectorSearchScreenProps) {
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 py-8 -mt-6">
      {/* Feature Badges */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm backdrop-blur-sm">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-foreground font-medium">Alcance Mundial</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-background/50 text-sm backdrop-blur-sm">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-foreground font-medium">IA Avançada</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-background/50 text-sm backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-foreground font-medium">Powered by Nexia</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Prospectar Leads
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed">
          Descubra leads qualificados em qualquer região. Nossa IA analisa o mercado e entrega contatos prontos para prospecção.
        </p>
      </div>

      {/* Globe - Central Element */}
      <div className="relative flex justify-center mb-10">
        <PremiumGlobeCanvas size={320} />
      </div>

      {/* Search Form */}
      <div className="w-full max-w-lg">
        <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 p-5 md:p-6 space-y-5 shadow-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nicho" className="flex items-center gap-2 text-foreground text-sm">
                <Building2 className="h-4 w-4 text-primary" />
                Nicho / Segmento
              </Label>
              <Input
                id="nicho"
                placeholder="Ex: Barbearia, Clínica..."
                value={nicho}
                onChange={(e) => onNichoChange(e.target.value)}
                className="bg-background/60 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade" className="flex items-center gap-2 text-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                Cidade ou Região
              </Label>
              <Input
                id="cidade"
                placeholder="Ex: São Paulo..."
                value={cidade}
                onChange={(e) => onCidadeChange(e.target.value)}
                className="bg-background/60 border-border/50 focus:border-primary/50"
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
              <Label htmlFor="possuiSite" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground text-sm">
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
              <Label htmlFor="possuiInstagram" className="flex items-center gap-1.5 cursor-pointer text-muted-foreground text-sm">
                <Instagram className="h-4 w-4 text-pink-500" />
                Possui Instagram
              </Label>
            </div>
          </div>

          <Button 
            onClick={onSearch} 
            disabled={isSearching} 
            className="w-full gap-2 h-12 text-base font-semibold shadow-lg shadow-primary/20"
            size="lg"
          >
            <Search className="h-5 w-5" />
            Iniciar Busca
          </Button>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-xs text-muted-foreground/70 mt-4">
          Prospecção inteligente com a tecnologia Nexia
        </p>
      </div>
    </div>
  );
}
