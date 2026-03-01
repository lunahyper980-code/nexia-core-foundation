import { Building2, MapPin, Globe, Instagram, Map, Copy, Bookmark, UserPlus, ExternalLink, CheckCircle, HelpCircle, AlertTriangle, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useState } from 'react';

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

interface RadarResultsProps {
  leads: Lead[];
  onNewSearch: () => void;
}

export function RadarResults({ leads, onNewSearch }: RadarResultsProps) {
  const { workspace } = useWorkspace();

  const handleSaveLead = async (lead: Lead) => {
    if (!workspace?.id) {
      toast.error('Workspace não encontrado');
      return;
    }
    try {
      const { error } = await supabase.from('clients').insert({
        name: lead.nome,
        segment: lead.segmento,
        city: lead.localizacao,
        notes: lead.endereco ? `Endereço: ${lead.endereco}` : undefined,
        workspace_id: workspace.id,
        status: 'lead',
      });
      if (error) throw error;
      toast.success(`${lead.nome} salvo em Clientes!`);
    } catch {
      toast.error('Erro ao salvar lead');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{leads.length} empresas detectadas</h2>
          <p className="text-sm text-muted-foreground">Resultados do escaneamento local</p>
        </div>
        <Button variant="outline" onClick={onNewSearch}>Nova busca</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead) => (
          <RadarLeadCard key={lead.id} lead={lead} onSaveLead={handleSaveLead} />
        ))}
      </div>
    </div>
  );
}

function RadarLeadCard({ lead, onSaveLead }: { lead: Lead; onSaveLead: (lead: Lead) => void }) {
  const [mapError, setMapError] = useState(false);

  const buildMapsQuery = (): string => {
    const parts = lead.localizacao.split(/[-,]/);
    const cidade = parts[0]?.trim() || lead.localizacao;
    const estado = parts[1]?.trim() || '';

    if (lead.endereco) {
      return `${lead.nome} ${lead.endereco}, ${cidade}, ${estado}`;
    }
    return `${lead.nome} ${cidade} ${estado} ${lead.segmento}`;
  };

  const mapsQuery = buildMapsQuery();
  const mapsQueryEncoded = encodeURIComponent(mapsQuery);
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQueryEncoded}`;
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${mapsQueryEncoded}&output=embed`;

  const getConfiancaBadge = () => {
    switch (lead.confiancaNome) {
      case 'alta':
        return (
          <Badge variant="secondary" className="gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="h-3 w-3" /> Confirmado
          </Badge>
        );
      case 'baixa':
        return (
          <Badge variant="secondary" className="gap-1 text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20">
            <AlertTriangle className="h-3 w-3" /> Estimado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
            <HelpCircle className="h-3 w-3" /> Provável
          </Badge>
        );
    }
  };

  return (
    <Card className="group hover:shadow-xl hover:border-primary/40 transition-all duration-200 overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-border/60">
      <CardContent className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">{lead.nome}</h3>
              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{lead.segmento}</Badge>
                {getConfiancaBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{lead.localizacao}</span>
          </div>
          {lead.endereco && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Map className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{lead.endereco}</span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {lead.temSite && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                <Globe className="h-3 w-3" /> Site
              </div>
            )}
            {lead.temInstagram && (
              <div className="flex items-center gap-1 text-[10px] text-pink-600">
                <Instagram className="h-3 w-3" /> Instagram
              </div>
            )}
            {!lead.temSite && !lead.temInstagram && (
              <Badge variant="destructive" className="text-[10px]">Sem presença digital</Badge>
            )}
          </div>
        </div>

        {/* Mini Mapa */}
        <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border/50 bg-muted/20">
          {!mapError ? (
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mapa de ${lead.nome}`}
              onError={() => setMapError(true)}
              className="rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs">
              <Map className="h-6 w-6 mb-1 opacity-40" />
              <span>Abrir no Google Maps</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 pt-1">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1.5 h-8 text-xs"
            onClick={() => onSaveLead(lead)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Salvar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(googleMapsSearchUrl, '_blank')}
            title="Ampliar mapa"
          >
            <Map className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              navigator.clipboard.writeText(`${lead.nome} - ${lead.segmento} - ${lead.localizacao}`);
              toast.success('Dados copiados!');
            }}
            title="Copiar dados"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
