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
          <div className="animate-fade-in">
            {/* Animated robot scanner card */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 min-h-[420px] sm:min-h-[480px]">
              <RadarIdleAnimation />
              {/* Floating form overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 z-10">
                <div
                  className="mx-4 mb-4 sm:mx-6 sm:mb-6 p-4 sm:p-5 rounded-xl max-w-md mx-auto"
                  style={{
                    background: 'rgba(8, 8, 16, 0.75)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <h2 className="text-sm font-semibold text-foreground text-center mb-1">Onde você está?</h2>
                  <p className="text-[11px] text-muted-foreground text-center mb-4">
                    Informe sua localidade para iniciar o escaneamento
                  </p>

                  <div className="space-y-3">
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
                        className="h-10 bg-background/40 border-border/30 text-sm"
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
