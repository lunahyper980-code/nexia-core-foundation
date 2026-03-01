import { useState, useEffect, useRef } from 'react';
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
import { useModuleState } from '@/hooks/useModuleState';

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
  const { getSavedState, saveSubScreen, saveFormData, saveExtras, clearState } = useModuleState('radar');

  // Restore persisted state
  const saved = getSavedState();
  const [localidade, setLocalidade] = useState(saved?.formData?.localidade || '');
  const [screen, setScreen] = useState<Screen>(() => {
    if (saved?.subScreen === 'results' && saved?.extras?.leads?.length) return 'results';
    return 'form';
  });
  const [leads, setLeads] = useState<Lead[]>(saved?.extras?.leads || []);
  const navigate = useNavigate();

  // Persist screen changes
  useEffect(() => {
    saveSubScreen(screen);
  }, [screen, saveSubScreen]);

  // Persist localidade
  useEffect(() => {
    saveFormData({ localidade });
  }, [localidade, saveFormData]);

  // Persist leads
  useEffect(() => {
    if (leads.length > 0) {
      saveExtras({ leads });
    }
  }, [leads, saveExtras]);

  const [scanProgress, setScanProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const handleScan = async () => {
    if (!localidade.trim()) {
      toast.error('Informe sua cidade ou bairro');
      return;
    }

    setScreen('scanning');
    setScanProgress(0);

    // Fast progress simulation - reaches ~90% quickly
    let progress = 0;
    progressRef.current = setInterval(() => {
      progress += progress < 60 ? 5 : progress < 85 ? 3 : 1;
      if (progress > 95) progress = 95;
      setScanProgress(Math.min(progress, 95));
    }, 80);

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

      if (progressRef.current) clearInterval(progressRef.current);
      setScanProgress(100);

      const allLeads = [...(data?.leads || []), ...(data?.leadsNaoConfirmados || [])];
      setLeads(allLeads);

      setTimeout(() => setScreen('results'), 400);
    } catch (err) {
      console.error('Radar error:', err);
      if (progressRef.current) clearInterval(progressRef.current);
      setScanProgress(0);
      toast.error('Erro ao escanear região. Tente novamente.');
      setScreen('form');
    }
  };

  const handleNewSearch = () => {
    setLeads([]);
    setLocalidade('');
    setScreen('form');
    clearState();
  };

  return (
    <AppLayout title="Radar">
      {/* Removed full-screen scan animation */}

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
            <div className="relative rounded-2xl overflow-hidden border border-border/40 h-[420px] sm:h-[500px]">
              <RadarIdleAnimation isScanning={false} scanProgress={0} />
            </div>

            {/* Form card - compact & translucent */}
            <div className="max-w-sm mx-auto w-full">
              <Card className="p-3 space-y-2 bg-card/60 backdrop-blur-sm border-border/30">
                <h2 className="text-xs font-semibold text-foreground text-center">Onde você está?</h2>

                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1 text-left">
                    <Label htmlFor="localidade" className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      Cidade / Bairro
                    </Label>
                    <Input
                      id="localidade"
                      placeholder="Ex: São Paulo, Pinheiros"
                      value={localidade}
                      onChange={(e) => setLocalidade(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                      className="h-9 text-sm"
                    />
                  </div>
                  <Button
                    className="gap-1.5 h-9 px-4 shrink-0"
                    size="sm"
                    onClick={handleScan}
                    disabled={!localidade.trim()}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Ativar Radar
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {screen === 'scanning' && (
          <div className="animate-fade-in">
            {/* Drone animation focused on progress */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 h-[420px] sm:h-[500px]">
              <RadarIdleAnimation isScanning={true} scanProgress={scanProgress} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3 animate-pulse">
              Escaneando empresas em <span className="font-semibold text-foreground">{localidade}</span>...
            </p>
          </div>
        )}

        {screen === 'results' && (
          <RadarResults leads={leads} onNewSearch={handleNewSearch} />
        )}
      </div>
    </AppLayout>
  );
}
