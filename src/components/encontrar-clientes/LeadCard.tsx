import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram,
  MessageCircle,
  Copy,
  Bookmark,
  ExternalLink,
  Map,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export interface Lead {
  id: string;
  nome: string;
  segmento: string;
  localizacao: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  temSite?: boolean;
  temInstagram?: boolean;
  confiancaNome?: 'alta' | 'media' | 'baixa';
  telefonePublico?: boolean;
  linkPublico?: string;
}

interface LeadCardProps {
  lead: Lead;
  onGenerateMessage: (lead: Lead) => void;
  onSaveLead: (lead: Lead) => void;
}

export function LeadCard({ lead, onGenerateMessage, onSaveLead }: LeadCardProps) {
  const [mapError, setMapError] = useState(false);
  
  // Extrair cidade e estado da localização se não existirem separados
  const extractCidadeEstado = () => {
    if (lead.cidade && lead.estado) {
      return { cidade: lead.cidade, estado: lead.estado };
    }
    
    // Tentar extrair de localizacao (formato: "Cidade - Estado" ou "Cidade, Estado")
    const parts = lead.localizacao.split(/[-,]/);
    if (parts.length >= 2) {
      return {
        cidade: parts[0].trim(),
        estado: parts[1].trim()
      };
    }
    
    return { cidade: lead.localizacao, estado: '' };
  };

  // Função principal para construir query otimizada para Google Maps
  const buildMapsQuery = (): string => {
    const { cidade, estado } = extractCidadeEstado();
    const temNomeConfiavel = lead.confiancaNome !== 'baixa';
    
    // Prioridade A: Nome + Endereço completo (rua + número + bairro + cidade + estado)
    if (lead.endereco && temNomeConfiavel) {
      const enderecoCompleto = lead.bairro 
        ? `${lead.endereco}, ${lead.bairro}, ${cidade}, ${estado}`
        : `${lead.endereco}, ${cidade}, ${estado}`;
      return `${lead.nome} ${enderecoCompleto}`;
    }
    
    // Prioridade B: Nome + Bairro + Cidade + Estado
    if (lead.bairro && temNomeConfiavel) {
      return `${lead.nome} ${lead.bairro}, ${cidade}, ${estado}`;
    }
    
    // Prioridade C: Nome + Cidade + Estado + Categoria
    if (temNomeConfiavel) {
      return `${lead.nome} ${cidade} ${estado} ${lead.segmento}`;
    }
    
    // Fallback para nome com baixa confiança: Categoria + Bairro/Cidade + Estado
    if (lead.bairro) {
      return `${lead.segmento} ${lead.bairro}, ${cidade}, ${estado}`;
    }
    
    return `${lead.segmento} ${cidade} ${estado}`;
  };

  const mapsQueryRaw = buildMapsQuery();
  const mapsQueryEncoded = encodeURIComponent(mapsQueryRaw);
  
  // URLs otimizadas
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQueryEncoded}`;
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${mapsQueryEncoded}&output=embed`;
  const googleSearchUrl = `https://www.google.com/search?q=${mapsQueryEncoded}+telefone+endereço`;

  const copyData = () => {
    const dataParts = [
      `Nome: ${lead.nome}`,
      `Segmento: ${lead.segmento}`,
      `Localização: ${lead.localizacao}`,
    ];
    
    if (lead.endereco) {
      dataParts.push(`Endereço: ${lead.endereco}`);
    }
    
    if (lead.telefone && lead.telefonePublico) {
      dataParts.push(`Telefone: ${lead.telefone}`);
    }
    
    if (lead.linkPublico) {
      dataParts.push(`Link: ${lead.linkPublico}`);
    }
    
    navigator.clipboard.writeText(dataParts.join('\n'));
    toast.success('Dados copiados!');
  };

  const copySearchQuery = () => {
    navigator.clipboard.writeText(mapsQueryRaw);
    toast.success('Busca copiada! Cole no Google Maps.');
  };

  const getConfiancaBadge = () => {
    const confianca = lead.confiancaNome || 'media';
    
    switch (confianca) {
      case 'alta':
        return (
          <Badge variant="secondary" className="gap-1 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="h-3 w-3" />
            Confirmado
          </Badge>
        );
      case 'media':
        return (
          <Badge variant="secondary" className="gap-1 text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
            <HelpCircle className="h-3 w-3" />
            Provável
          </Badge>
        );
      case 'baixa':
        return (
          <Badge variant="secondary" className="gap-1 text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
            <AlertTriangle className="h-3 w-3" />
            Estimado
          </Badge>
        );
    }
  };

  return (
    <Card className="group hover:shadow-xl hover:border-primary/40 transition-all duration-200 overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-border/60">
      <CardContent className="p-3 space-y-3">
        {/* Header - Compacto */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">{lead.nome}</h3>
              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {lead.segmento}
                </Badge>
                {getConfiancaBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Alerta para nome estimado - Compacto */}
        {lead.confiancaNome === 'baixa' && (
          <div className="flex items-center gap-1.5 text-[10px] text-orange-600 bg-orange-500/5 px-2 py-1.5 rounded-md border border-orange-500/10">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>Nome estimado - confirme no Maps</span>
          </div>
        )}

        {/* Info - Compacto */}
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
          
          {/* Telefone - só mostra se for público/real */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {lead.telefone && lead.telefonePublico ? (
              <span className="text-foreground font-medium">{lead.telefone}</span>
            ) : (
              <span className="italic text-muted-foreground/60 text-[11px]">Ver no Maps</span>
            )}
          </div>

          {(lead.temSite || lead.temInstagram || lead.linkPublico) && (
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {lead.temSite && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <Globe className="h-3 w-3" />
                  <span>Site</span>
                </div>
              )}
              {lead.temInstagram && (
                <div className="flex items-center gap-1 text-[10px] text-pink-600">
                  <Instagram className="h-3 w-3" />
                  <span>Instagram</span>
                </div>
              )}
              {lead.linkPublico && (
                <a 
                  href={lead.linkPublico} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Link</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Mini Mapa do Google - Menor */}
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

        {/* Actions - Linha única compacta */}
        <div className="flex gap-1.5 pt-1">
          <Button
            variant="default"
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
            onClick={copyData}
            title="Copiar dados"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onSaveLead(lead)}
            title="Salvar lead"
          >
            <Bookmark className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
