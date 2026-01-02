import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  AlertCircle, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  ClipboardList,
  Users,
  Search,
  MapPin
} from 'lucide-react';
import { LeadCard, Lead } from './LeadCard';

interface LeadsResultsScreenProps {
  leads: Lead[];
  leadsNaoConfirmados: Lead[];
  nicho: string;
  cidade: string;
  onGenerateMessage: (lead: Lead) => void;
  onSaveLead: (lead: Lead) => void;
  onNewSearch: () => void;
}

export function LeadsResultsScreen({
  leads,
  leadsNaoConfirmados,
  nicho,
  cidade,
  onGenerateMessage,
  onSaveLead,
  onNewSearch,
}: LeadsResultsScreenProps) {
  const navigate = useNavigate();
  const [showUnconfirmed, setShowUnconfirmed] = useState(false);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header with back button and summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-border/50 p-6 md:p-8">
        {/* Background effects */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNewSearch}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nova Busca
          </Button>

          {/* Results summary */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {leads.length} Leads Encontrados
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Search className="h-4 w-4" />
                <span>{nicho}</span>
                <span className="text-muted-foreground/50">•</span>
                <MapPin className="h-4 w-4" />
                <span>{cidade}</span>
              </p>
            </div>
          </div>

          {/* Quick tip */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
            <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Dica:</span> Para telefone e fotos oficiais, toque em "Ampliar mapa" dentro do card do lead.
            </p>
          </div>
        </div>
      </div>

      {/* Briefing reminder */}
      <Alert className="border-primary/30 bg-primary/5">
        <ClipboardList className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <strong>Próximo passo:</strong> Após o primeiro contato positivo com o cliente, gere o{' '}
          <button 
            onClick={() => navigate('/briefing-rapido')}
            className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Briefing Rápido
          </button>
          {' '}antes de avançar para o diagnóstico ou planejamento.
        </AlertDescription>
      </Alert>

      {/* Leads grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onGenerateMessage={onGenerateMessage}
            onSaveLead={onSaveLead}
          />
        ))}
      </div>

      {/* Unconfirmed leads - collapsible */}
      {leadsNaoConfirmados.length > 0 && (
        <Collapsible open={showUnconfirmed} onOpenChange={setShowUnconfirmed}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Possíveis resultados não confirmados ({leadsNaoConfirmados.length})
              </span>
              {showUnconfirmed ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground px-1">
              Estes leads não passaram na validação mínima. Use com cautela.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 opacity-80">
              {leadsNaoConfirmados.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onGenerateMessage={onGenerateMessage}
                  onSaveLead={onSaveLead}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Os leads são gerados por IA com base em padrões de mercado. <strong>Telefones não são inventados</strong> - use o botão "Ampliar mapa" para encontrar dados de contato oficiais.
        </AlertDescription>
      </Alert>

      {/* New search button at bottom */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onNewSearch}
          className="gap-2"
        >
          <Search className="h-5 w-5" />
          Fazer Nova Busca
        </Button>
      </div>
    </div>
  );
}
