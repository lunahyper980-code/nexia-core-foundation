import { Building2, MapPin, Globe, Instagram, ChevronRight, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

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
          <Card key={lead.id} className="p-4 flex flex-col gap-3 hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-sm truncate">{lead.nome}</span>
              </div>
              {lead.confiancaNome === 'alta' && (
                <Badge variant="secondary" className="text-[10px] flex-shrink-0">Confiável</Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{lead.segmento}</p>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{lead.endereco || lead.localizacao}</span>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              {lead.temSite && (
                <Badge variant="outline" className="text-[10px] gap-1"><Globe className="h-3 w-3" /> Site</Badge>
              )}
              {lead.temInstagram && (
                <Badge variant="outline" className="text-[10px] gap-1"><Instagram className="h-3 w-3" /> Insta</Badge>
              )}
              {!lead.temSite && !lead.temInstagram && (
                <Badge variant="destructive" className="text-[10px]">Sem presença digital</Badge>
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="w-full mt-1 text-xs gap-1 text-primary hover:text-primary"
              onClick={() => handleSaveLead(lead)}
            >
              <UserPlus className="h-3.5 w-3.5" /> Salvar como cliente
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
