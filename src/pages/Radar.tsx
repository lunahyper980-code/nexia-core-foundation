import { useState } from 'react';
import { Radar as RadarIcon, MapPin, Zap } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadarScanAnimation } from '@/components/radar/RadarScanAnimation';
import { RadarResults } from '@/components/radar/RadarResults';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <RadarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Radar</h1>
            <p className="text-sm text-muted-foreground">Localizador de empresas na sua região</p>
          </div>
        </div>

        {screen === 'form' && (
          <Card className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Onde você está?</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Informe sua cidade e bairro para o radar escanear empresas próximas a você.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="localidade">Cidade / Bairro</Label>
                <Input
                  id="localidade"
                  placeholder="Ex: Araruama, Iguabinha"
                  value={localidade}
                  onChange={(e) => setLocalidade(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
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
          </Card>
        )}

        {screen === 'results' && (
          <RadarResults leads={leads} onNewSearch={handleNewSearch} />
        )}
      </div>
    </AppLayout>
  );
}
