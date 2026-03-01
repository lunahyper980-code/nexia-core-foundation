import { useState } from 'react';
import { Radar as RadarIcon, MapPin, Zap, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
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
          <div className="animate-fade-in space-y-4">
            {/* Robot scanner animation card */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 h-[320px] sm:h-[360px]">
              <RadarIdleAnimation />
            </div>

            {/* Form card - separate, below */}
            <div className="max-w-md mx-auto w-full">
              <Card className="p-4 sm:p-5 space-y-3">
                <div className="text-center">
                  <h2 className="text-sm font-semibold text-foreground">Onde você está?</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Informe sua localidade para iniciar o escaneamento
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="localidade" className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                      <MapPin className="h-3 w-3 text-primary" />
                      Cidade / Bairro
                    </Label>
                    <Input
                      id="localidade"
                      placeholder="Ex: Araruama, Iguabinha"
                      value={localidade}
                      onChange={(e) => setLocalidade(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                      className="h-10"
                    />
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="default"
                    onClick={handleScan}
                    disabled={!localidade.trim()}
                  >
                    <Zap className="h-4 w-4" />
                    Ativar Radar
                  </Button>
                </div>
              </Card>
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
