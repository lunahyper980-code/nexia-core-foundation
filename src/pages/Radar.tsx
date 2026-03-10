import { useState, useEffect, useRef } from 'react';
import { Radar as RadarIcon, MapPin, Zap, ArrowLeft, LocateFixed, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
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

type Screen = 'form' | 'locating' | 'scanning' | 'results';

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`,
    { headers: { 'User-Agent': 'NexiaApp/1.0' } }
  );
  const data = await res.json();
  const addr = data.address || {};
  const bairro = addr.suburb || addr.neighbourhood || addr.village || '';
  const cidade = addr.city || addr.town || addr.municipality || addr.county || '';
  const estado = addr.state || '';
  
  if (bairro && cidade) return `${cidade}, ${bairro}`;
  if (cidade && estado) return `${cidade}, ${estado}`;
  if (cidade) return cidade;
  return data.display_name?.split(',').slice(0, 2).join(',') || `${lat},${lng}`;
}

export default function Radar() {
  const { getSavedState, saveSubScreen, saveFormData, saveExtras, clearState } = useModuleState('radar');

  const saved = getSavedState();
  const [localidade, setLocalidade] = useState(saved?.formData?.localidade || '');
  const [screen, setScreen] = useState<Screen>(() => {
    if (saved?.subScreen === 'results' && saved?.extras?.leads?.length) return 'results';
    return 'form';
  });
  const [leads, setLeads] = useState<Lead[]>(saved?.extras?.leads || []);
  const navigate = useNavigate();

  useEffect(() => {
    saveSubScreen(screen);
  }, [screen, saveSubScreen]);

  useEffect(() => {
    saveFormData({ localidade });
  }, [localidade, saveFormData]);

  useEffect(() => {
    if (leads.length > 0) {
      saveExtras({ leads });
    }
  }, [leads, saveExtras]);

  const [scanProgress, setScanProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startScan = async (location: string) => {
    setScreen('scanning');
    setScanProgress(0);

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
          cidade: location,
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

  const handleActivateRadar = async () => {
    if (!navigator.geolocation) {
      toast.error('Seu navegador não suporta geolocalização.');
      return;
    }

    setScreen('locating');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const location = await reverseGeocode(latitude, longitude);
          setLocalidade(location);
          toast.success(`Localização detectada: ${location}`);
          startScan(location);
        } catch (err) {
          console.error('Reverse geocode error:', err);
          toast.error('Erro ao identificar sua localização. Tente novamente.');
          setScreen('form');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Permissão de localização negada. Habilite nas configurações do navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Localização indisponível. Tente novamente.');
            break;
          case error.TIMEOUT:
            toast.error('Tempo esgotado ao buscar localização. Tente novamente.');
            break;
          default:
            toast.error('Erro ao obter localização.');
        }
        setScreen('form');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleNewSearch = () => {
    setLeads([]);
    setLocalidade('');
    setScreen('form');
    clearState();
  };

  return (
    <AppLayout title="Radar">
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
            <div className="relative rounded-2xl overflow-hidden border border-border/40 h-[420px] sm:h-[500px]">
              <RadarIdleAnimation isScanning={false} scanProgress={0} />
            </div>

            <div className="max-w-[200px] mx-auto w-full flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                className="gap-2 h-10 px-5 text-xs font-medium bg-foreground/5 hover:bg-foreground/10 border border-border/30 rounded-full backdrop-blur-sm"
                onClick={handleActivateRadar}
              >
                <LocateFixed className="h-3.5 w-3.5" />
                Ativar Radar
              </Button>
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Localização automática
              </p>
            </div>
          </div>
        )}

        {screen === 'locating' && (
          <div className="animate-fade-in space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-border/40 h-[420px] sm:h-[500px]">
              <RadarIdleAnimation isScanning={false} scanProgress={0} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Obtendo sua localização...</span>
              </div>
              <p className="text-[11px] text-muted-foreground/50">Permita o acesso à localização quando solicitado</p>
            </div>
          </div>
        )}

        {screen === 'scanning' && (
          <div className="animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden border border-border/40 h-[420px] sm:h-[500px]">
              <RadarIdleAnimation isScanning={true} scanProgress={scanProgress} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3 animate-pulse">
              Escaneando empresas na sua região...
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
