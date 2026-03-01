import { useState } from 'react';
import { Radar as RadarIcon, MapPin, Zap, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadarScanAnimation } from '@/components/radar/RadarScanAnimation';
import { RadarResults } from '@/components/radar/RadarResults';
import { RadarIdleAnimation } from '@/components/radar/RadarIdleAnimation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: string;
  nome: string;
  segmento: string;
  localizacao: string;
  endereco?: string | null;
  temSite: boolean;
  temInstagram: boolean;
  confiancaNome: string;
  camada?: string;
}

type Screen = 'form' | 'scanning' | 'results';

export default function Radar() {
  const [localidade, setLocalidade] = useState('');
  const [screen, setScreen] = useState<Screen>('form');
  const [leads, setLeads] = useState<Lead[]>([]);
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!localidade.trim()) {
      toast.error('Informe sua cidade ou bairro');
      return;
    }

    setScreen('scanning');

    try {
      const { data, error } = await supabase.functions.invoke('generate-leads', {
        body: {
          nicho: 'todos os tipos de negócios locais',
          cidade: localidade.trim(),
          possuiSite: false,
          possuiInstagram: false,
          forceRegenerate: true,
        },
      });

      if (error) throw error;

      const allLeads = [...(data?.leads || []), ...(data?.leadsNaoConfirmados || [])];
      setLeads(allLeads);
      setScreen('results');
    } catch (err) {
      console.error('Radar error:', err);
      toast.error('Erro ao escanear região. Tente novamente.');
      setScreen('form');
    }
  };

  const handleNewSearch = () => {
    setLeads([]);
    setLocalidade('');
    setScreen('form');
  };

  return (
    <AppLayout title="Radar">
      <RadarScanAnimation isActive={screen === 'scanning'} />

      <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {screen === 'results' && (
            <Button variant="ghost" size="icon" onClick={handleNewSearch} className="mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <RadarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Radar</h1>
            <p className="text-sm text-muted-foreground">Localizador de empresas na sua região</p>
          </div>
        </div>

        {screen === 'form' && (
          <div className="animate-fade-in space-y-6">
            {/* Animated idle card */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
              <RadarIdleAnimation />
              <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center text-center">
                <h2 className="text-lg font-semibold text-foreground mt-2">Onde você está?</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                  Informe sua cidade e bairro para o radar escanear empresas próximas a você.
                </p>

                <div className="w-full max-w-md mt-6 space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="localidade" className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Cidade / Bairro
                    </Label>
                    <Input
                      id="localidade"
                      placeholder="Ex: Araruama, Iguabinha"
                      value={localidade}
                      onChange={(e) => setLocalidade(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                      className="h-11"
                    />
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleScan}
                    disabled={!localidade.trim()}
                  >
                    <Zap className="h-4 w-4" />
                    Ativar Radar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === 'results' && (
          <RadarResults leads={leads} onNewSearch={handleNewSearch} />
        )}
      </div>
    </AppLayout>
  );
}
