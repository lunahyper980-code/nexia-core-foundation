import { useState, useEffect, useCallback } from 'react';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Globe, FolderPlus, FileCheck, CheckCircle, UserPlus, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fictionalNames = [
  // Nomes masculinos comuns
  'Lucas M.', 'Pedro H.', 'Gabriel F.', 'Rafael B.', 'Thiago N.', 'Bruno S.', 
  'Diego V.', 'Felipe O.', 'Rodrigo K.', 'Matheus C.', 'Gustavo L.', 'André P.',
  'Leonardo R.', 'Marcelo A.', 'Ricardo S.', 'Eduardo M.', 'João V.', 'Carlos R.',
  'Daniel F.', 'Vinícius T.', 'Henrique B.', 'Leandro C.', 'Fábio L.', 'Alexandre N.',
  'Caio S.', 'Igor M.', 'Renan P.', 'Wesley A.', 'Fernando G.', 'Marcos R.',
  'Paulo H.', 'Victor L.', 'William S.', 'Samuel F.', 'Murilo C.', 'Jonathan B.',
  // Nomes femininos comuns
  'Ana Paula S.', 'Fernanda L.', 'Juliana C.', 'Mariana T.', 'Camila A.', 'Letícia P.',
  'Isabela M.', 'Amanda R.', 'Natália G.', 'Beatriz D.', 'Bruna F.', 'Carolina S.',
  'Larissa M.', 'Vanessa L.', 'Patrícia R.', 'Aline C.', 'Priscila T.', 'Renata B.',
  'Tatiana V.', 'Débora A.', 'Jéssica P.', 'Daniela F.', 'Gabriela N.', 'Michele S.',
  'Raquel M.', 'Sabrina L.', 'Thais R.', 'Viviane C.', 'Bianca T.', 'Cláudia B.',
  'Elaine V.', 'Fabiana A.', 'Helena P.', 'Ingrid F.', 'Joana N.', 'Luana S.',
  'Marina M.', 'Nicole L.', 'Paula R.', 'Roberta C.', 'Sandra T.', 'Simone B.',
];

// Eventos SEM valor (apenas criação/início)
const eventsWithoutValue = [
  { type: 'projeto_criado', labels: ['criou novo projeto', 'iniciou projeto', 'criou nova solução'], icon: FolderPlus, color: 'text-primary' },
  { type: 'novo_usuario', labels: ['iniciou primeiro projeto', 'ativou operação', 'começou nova operação'], icon: UserPlus, color: 'text-purple-400' },
  { type: 'encontrou_cliente', labels: ['encontrou novo cliente', 'adicionou lead', 'prospectou cliente'], icon: UserPlus, color: 'text-muted-foreground' },
];

// Eventos COM valor (entrega/venda/conclusão) - aparecem mais frequentemente
const eventsWithValue = [
  { type: 'proposta_enviada', labels: ['enviou proposta', 'gerou proposta comercial', 'fechou proposta'], icon: FileCheck, color: 'text-warning' },
  { type: 'projeto_finalizado', labels: ['finalizou projeto', 'concluiu entrega', 'entregou solução'], icon: CheckCircle, color: 'text-success' },
  { type: 'entrega_concluida', labels: ['concluiu entrega', 'entregou material', 'finalizou projeto'], icon: Package, color: 'text-success' },
  { type: 'venda_realizada', labels: ['fechou venda', 'confirmou contrato', 'fechou negócio'], icon: TrendingUp, color: 'text-success' },
];

// Valores menores aparecem mais frequentemente (repetidos na lista)
const valueOptions = [
  650, 650, 650, 750, 750, 850, 850, 950, 950, 950,
  1100, 1100, 1250, 1400, 1600, 1600, 1600, 1800, 1800,
  2000, 2300, 2300, 2300, 2600, 2900, 3200, 3500, 3900, 4300, 4700
];

interface CommunityEvent {
  id: string;
  name: string;
  label: string;
  icon: typeof FolderPlus;
  color: string;
  value: number | null;
  time: string;
  isNew: boolean;
  isReal?: boolean;
}

// Mapeamento de tipos de activity_logs para eventos visuais
const activityTypeMap: Record<string, { labels: string[]; icon: typeof FolderPlus; color: string; hasValue?: boolean }> = {
  // Projetos
  'project_created': { labels: ['criou novo projeto'], icon: FolderPlus, color: 'text-primary' },
  'PROJECT_CREATED': { labels: ['criou novo projeto'], icon: FolderPlus, color: 'text-primary' },
  
  // Propostas
  'proposal_created': { labels: ['criou proposta'], icon: FileCheck, color: 'text-warning', hasValue: true },
  'PROPOSAL_CREATED': { labels: ['criou proposta'], icon: FileCheck, color: 'text-warning', hasValue: true },
  'proposal_sent': { labels: ['enviou proposta'], icon: FileCheck, color: 'text-warning', hasValue: true },
  'PROPOSAL_GENERATED': { labels: ['gerou proposta comercial'], icon: FileCheck, color: 'text-warning', hasValue: true },
  
  // Clientes
  'client_created': { labels: ['adicionou cliente'], icon: UserPlus, color: 'text-muted-foreground' },
  'client_updated': { labels: ['atualizou cliente'], icon: UserPlus, color: 'text-muted-foreground' },
  
  // Entregas
  'delivery_created': { labels: ['registrou entrega'], icon: Package, color: 'text-success', hasValue: true },
  'DELIVERY_CREATED': { labels: ['registrou entrega'], icon: Package, color: 'text-success', hasValue: true },
  'DELIVERY_FINALIZED': { labels: ['finalizou entrega'], icon: Package, color: 'text-success', hasValue: true },
  
  // Contratos
  'contract_created': { labels: ['criou contrato'], icon: CheckCircle, color: 'text-success', hasValue: true },
  'CONTRACT_CREATED': { labels: ['criou contrato'], icon: CheckCircle, color: 'text-success', hasValue: true },
  'CONTRACT_GENERATED': { labels: ['gerou contrato'], icon: CheckCircle, color: 'text-success', hasValue: true },
  
  // Usuários
  'user_signup': { labels: ['entrou na comunidade'], icon: UserPlus, color: 'text-purple-400' },
  
  // Diagnósticos e Posicionamento
  'diagnosis_created': { labels: ['criou diagnóstico'], icon: FolderPlus, color: 'text-primary' },
  'positioning_created': { labels: ['definiu posicionamento'], icon: TrendingUp, color: 'text-primary' },
  'POSITIONING_GENERATED': { labels: ['gerou posicionamento'], icon: TrendingUp, color: 'text-primary' },
  'PROCESS_ORG_GENERATED': { labels: ['organizou processos'], icon: FolderPlus, color: 'text-primary' },
  
  // Identidade
  'identity_updated': { labels: ['atualizou identidade'], icon: TrendingUp, color: 'text-primary' },
  
  // Nexia
  'nexia_plan_created': { labels: ['criou planejamento'], icon: FolderPlus, color: 'text-primary' },
  'nexia_plan_completed': { labels: ['concluiu planejamento'], icon: CheckCircle, color: 'text-success' },
  'nexia_task_completed': { labels: ['concluiu tarefa'], icon: CheckCircle, color: 'text-success' },
};

// Gera timestamps variados para simular atividade passada (quando usuário estava offline)
const getRandomTime = (index: number): string => {
  // Cada posição na lista representa atividades progressivamente mais antigas
  const timeRanges = [
    ['há 1 hora', 'há 2 horas', 'há 3 horas'],
    ['há 4 horas', 'há 5 horas', 'há 6 horas'],
    ['há 8 horas', 'há 10 horas', 'há 12 horas'],
    ['há 14 horas', 'há 18 horas', 'há 1 dia'],
    ['há 1 dia', 'há 2 dias', 'há 2 dias'],
  ];
  
  const rangeIndex = Math.min(index, timeRanges.length - 1);
  const options = timeRanges[rangeIndex];
  return options[Math.floor(Math.random() * options.length)];
};

const formatRealTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 60000) return 'agora';
    
    return formatDistanceToNow(date, { 
      addSuffix: false, 
      locale: ptBR 
    }).replace('aproximadamente ', 'há ').replace('menos de ', 'há ');
  } catch {
    return 'agora';
  }
};

const generateEvent = (id: string, isNew: boolean = false): CommunityEvent => {
  // 60% eventos COM valor (entrega/venda), 40% sem valor (criação/início)
  const showValueEvent = Math.random() < 0.6;
  
  let template;
  let value: number | null = null;
  
  if (showValueEvent) {
    template = eventsWithValue[Math.floor(Math.random() * eventsWithValue.length)];
    value = valueOptions[Math.floor(Math.random() * valueOptions.length)];
  } else {
    template = eventsWithoutValue[Math.floor(Math.random() * eventsWithoutValue.length)];
  }
  
  const label = template.labels[Math.floor(Math.random() * template.labels.length)];
  const name = fictionalNames[Math.floor(Math.random() * fictionalNames.length)];
  
  return {
    id,
    name,
    label,
    icon: template.icon,
    color: template.color,
    value,
    time: isNew ? 'agora' : getRandomTime(0),
    isNew,
    isReal: false,
  };
};

const generateInitialEvents = (): CommunityEvent[] => {
  const events: CommunityEvent[] = [];
  const usedLabels = new Set<string>();
  
  for (let i = 0; i < 5; i++) {
    let event: CommunityEvent;
    let attempts = 0;
    
    // Evita repetir labels em sequência
    do {
      event = generateEvent(`initial-${i}-${Date.now()}`);
      attempts++;
    } while (usedLabels.has(event.label) && attempts < 10);
    
    event.time = getRandomTime(i);
    usedLabels.add(event.label);
    events.push(event);
  }
  
  return events;
};

// Converte um log de atividade real em evento de comunidade
const convertActivityToEvent = (
  activity: { id: string; type: string; message: string; created_at: string; metadata: Record<string, unknown> | null },
  userName: string,
  isNew: boolean = false
): CommunityEvent | null => {
  const mapping = activityTypeMap[activity.type];
  if (!mapping) return null;
  
  const label = mapping.labels[0];
  let value: number | null = null;
  
  // Extrai valor do metadata se existir
  if (mapping.hasValue && activity.metadata) {
    const metaValue = (activity.metadata as Record<string, unknown>).value;
    if (typeof metaValue === 'number') {
      value = metaValue;
    }
  }
  
  return {
    id: `real-${activity.id}`,
    name: userName,
    label,
    icon: mapping.icon,
    color: mapping.color,
    value,
    time: isNew ? 'agora' : formatRealTime(activity.created_at),
    isNew,
    isReal: true,
  };
};

export function AtividadeComunidade() {
  const [events, setEvents] = useState<CommunityEvent[]>(() => generateInitialEvents());
  const [lastLabel, setLastLabel] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Obtém o ID do usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
      setIsReady(true);
    };
    getCurrentUser();
  }, []);

  // Não busca atividades reais no carregamento inicial - mantém apenas fictícias
  // As atividades reais só aparecem em tempo real quando acontecem

  // Função para adicionar um novo evento (real ou fictício) no topo
  const addEventToFeed = useCallback((newEvent: CommunityEvent) => {
    setEvents(prev => {
      // Atualiza timestamps dos eventos existentes
      const updatedEvents = prev.map((event, index) => ({
        ...event,
        time: getRandomTime(index + 1),
        isNew: false,
      }));
      
      // Adiciona novo evento no topo e mantém máximo de 5
      return [newEvent, ...updatedEvents].slice(0, 5);
    });

    // Remove flag isNew após animação
    setTimeout(() => {
      setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, isNew: false } : e));
    }, 2000);
  }, []);

  // Realtime: escuta novas atividades reais (incluindo do próprio usuário)
  useEffect(() => {
    if (!isReady) return;

    const channel = supabase
      .channel('community-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        async (payload) => {
          const newActivity = payload.new as { 
            id: string; 
            type: string; 
            message: string; 
            created_at: string; 
            metadata: Record<string, unknown> | null;
            workspace_id: string;
          };
          
          const { data: workspace } = await supabase
            .from('workspaces')
            .select('user_id')
            .eq('id', newActivity.workspace_id)
            .single();
          
          if (!workspace) return;
          
          let displayName = 'Você';
          if (workspace.user_id !== currentUserId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', workspace.user_id)
              .single();
            
            if (profile?.full_name) {
              const parts = profile.full_name.trim().split(' ');
              if (parts.length >= 2) {
                displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
              } else {
                displayName = parts[0];
              }
            } else {
              displayName = 'Usuário';
            }
          }
          
          const event = convertActivityToEvent(newActivity, displayName, true);
          if (event) {
            addEventToFeed(event);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addEventToFeed, isReady, currentUserId]);

  // Adiciona novos eventos fictícios periodicamente
  const addNewFictionalEvent = useCallback(() => {
    let newEvent: CommunityEvent;
    let attempts = 0;
    
    do {
      newEvent = generateEvent(`event-${Date.now()}`, true);
      attempts++;
    } while (newEvent.label === lastLabel && attempts < 10);
    
    setLastLabel(newEvent.label);
    addEventToFeed(newEvent);
  }, [lastLabel, addEventToFeed]);

  // Intervalo de atualização: 20 minutos
  useEffect(() => {
    const intervalMs = 20 * 60 * 1000; // 20 minutos
    const timer = setInterval(() => {
      addNewFictionalEvent();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [addNewFictionalEvent]);

  return (
    <PremiumFrame title="🌍 Atividade da Comunidade Nexia" className="fade-in" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Globe className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">Atualizações em tempo real da comunidade</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-success">Ao vivo</span>
        </div>
      </div>

      <div className="space-y-2">
        {events.map((event) => {
          const EventIcon = event.icon;
          return (
            <div 
              key={event.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
                event.isNew 
                  ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20 animate-fade-in' 
                  : 'bg-primary/5 border-primary/10 hover:bg-primary/8'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors duration-300 ${event.isNew ? 'bg-primary/20' : 'bg-background/50'}`}>
                <EventIcon className={`h-4 w-4 ${event.color}`} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-sm font-medium transition-colors duration-300 ${event.isNew ? 'text-primary' : 'text-foreground'}`}>
                    {event.name}
                  </span>
                  <span className={`text-sm truncate transition-colors duration-300 ${event.isNew ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {event.label}
                  </span>
                  {event.value && (
                    <span className={`text-sm font-semibold transition-colors duration-300 ${event.isNew ? 'text-primary' : 'text-success'}`}>
                      — R$ {event.value.toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/70">{event.time}</p>
              </div>
              {event.isNew && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </PremiumFrame>
  );
}
