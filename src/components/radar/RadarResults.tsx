import { Building2, MapPin, Globe, Instagram, Map, Copy, MessageCircle, CheckCircle, HelpCircle, AlertTriangle, Radio, ScanSearch, Crosshair, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { ApproachModal } from '@/components/encontrar-clientes/ApproachModal';
import type { Lead as LeadCardLead } from '@/components/encontrar-clientes/LeadCard';

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
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleGenerateMessage = (lead: Lead) => {
    setSelectedLead(lead);
    setMessageModalOpen(true);
  };

  const modalLead: LeadCardLead | null = selectedLead ? {
    id: selectedLead.id,
    nome: selectedLead.nome,
    segmento: selectedLead.segmento,
    localizacao: selectedLead.localizacao,
    endereco: selectedLead.endereco || undefined,
    temSite: selectedLead.temSite,
    temInstagram: selectedLead.temInstagram,
    confiancaNome: (selectedLead.confiancaNome as 'alta' | 'media' | 'baixa') || 'media',
  } : null;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Radar-style header */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                {leads.length}
                <span className="text-primary text-base font-medium">sinais captados</span>
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Crosshair className="h-3 w-3 text-primary/60" />
                Escaneamento da região concluído
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onNewSearch} className="border-primary/20 hover:bg-primary/10 hover:text-primary text-xs">
            <ScanSearch className="h-3.5 w-3.5 mr-1.5" />
            Novo scan
          </Button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead) => (
          <RadarLeadCard key={lead.id} lead={lead} onGenerateMessage={handleGenerateMessage} />
        ))}
      </div>

      <ApproachModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        lead={modalLead}
      />
    </div>
  );
}

function RadarLeadCard({ lead, onGenerateMessage }: { lead: Lead; onGenerateMessage: (lead: Lead) => void }) {
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

  return (
    <Card className="group hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-200 overflow-hidden bg-gradient-to-b from-card to-primary/[0.03] border-border/40">
      <CardContent className="p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/15">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold text-foreground text-sm leading-tight break-words line-clamp-2">{lead.nome}</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1 max-w-full truncate">{lead.segmento}</Badge>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0 text-primary/50" />
          <span className="truncate">{lead.localizacao}</span>
        </div>

        {/* Digital presence needs */}
        <div className="flex flex-wrap gap-1.5">
          {!lead.temSite && (
            <Badge variant="destructive" className="text-[10px] gap-1 h-5">
              <AlertCircle className="h-2.5 w-2.5" /> Precisa de Site
            </Badge>
          )}
          {!lead.temInstagram && (
            <Badge className="text-[10px] gap-1 h-5 bg-orange-500/10 text-orange-600 border-orange-500/20" variant="secondary">
              <AlertCircle className="h-2.5 w-2.5" /> Sem Presença Digital
            </Badge>
          )}
          {lead.temSite && lead.temInstagram && (
            <Badge variant="secondary" className="text-[10px] gap-1 h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <CheckCircle className="h-2.5 w-2.5" /> Presença OK
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5">
          <Button
            size="sm"
            className="flex-1 gap-1.5 h-8 text-xs"
            onClick={() => onGenerateMessage(lead)}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Mensagem
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-primary/20 hover:bg-primary/10"
            onClick={() => window.open(googleMapsSearchUrl, '_blank')}
            title="Ampliar mapa"
          >
            <Map className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-primary/20 hover:bg-primary/10"
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
