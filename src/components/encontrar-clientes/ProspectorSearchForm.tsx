import { Search, Building2, MapPin, Globe, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ProspectorSearchFormProps {
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

export function ProspectorSearchForm({
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
}: ProspectorSearchFormProps) {
  return (
    <div className="w-full max-w-lg mx-auto mt-8 sm:mt-12">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6 shadow-2xl">
        <div className="space-y-4">
          {/* Nicho field */}
          <div className="space-y-2">
            <Label htmlFor="nicho" className="flex items-center gap-2 text-white/80 text-sm">
              <Building2 className="h-4 w-4 text-purple-400" />
              Nicho / Segmento
            </Label>
            <Input
              id="nicho"
              placeholder="Ex: Barbearia, Clínica, Restaurante..."
              value={nicho}
              onChange={(e) => onNichoChange(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>

          {/* Cidade field */}
          <div className="space-y-2">
            <Label htmlFor="cidade" className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin className="h-4 w-4 text-purple-400" />
              Cidade ou Região
            </Label>
            <Input
              id="cidade"
              placeholder="Ex: São Paulo, Zona Sul de SP..."
              value={cidade}
              onChange={(e) => onCidadeChange(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="possuiSite"
                checked={possuiSite}
                onCheckedChange={(checked) => onPossuiSiteChange(checked === true)}
                className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="possuiSite" className="flex items-center gap-1.5 cursor-pointer text-white/60 text-sm">
                <Globe className="h-4 w-4 text-emerald-400" />
                Possui site
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="possuiInstagram"
                checked={possuiInstagram}
                onCheckedChange={(checked) => onPossuiInstagramChange(checked === true)}
                className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="possuiInstagram" className="flex items-center gap-1.5 cursor-pointer text-white/60 text-sm">
                <Instagram className="h-4 w-4 text-pink-400" />
                Possui Instagram
              </Label>
            </div>
          </div>

          {/* Search button */}
          <Button
            onClick={onSearch}
            disabled={isSearching}
            className="w-full h-12 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-base shadow-lg shadow-purple-500/25 border-0"
            size="lg"
          >
            <Search className="h-5 w-5 mr-2" />
            Iniciar Busca
          </Button>
        </div>
      </div>
    </div>
  );
}
