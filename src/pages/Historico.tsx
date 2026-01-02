import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Loader2, History, Users, Package, Fingerprint, UserPlus } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'client_created':
      return <UserPlus className="h-4 w-4 text-success" />;
    case 'client_updated':
      return <Users className="h-4 w-4 text-warning" />;
    case 'client_deleted':
      return <Users className="h-4 w-4 text-destructive" />;
    case 'identity_updated':
      return <Fingerprint className="h-4 w-4 text-primary" />;
    case 'user_signup':
      return <UserPlus className="h-4 w-4 text-primary" />;
    default:
      return <Package className="h-4 w-4 text-muted-foreground" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'client_created':
      return 'bg-success/10 border-success/20';
    case 'client_updated':
      return 'bg-warning/10 border-warning/20';
    case 'client_deleted':
      return 'bg-destructive/10 border-destructive/20';
    case 'identity_updated':
    case 'user_signup':
      return 'bg-primary/10 border-primary/20';
    default:
      return 'bg-primary/5 border-primary/10';
  }
};

export default function Historico() {
  const { logs, loading } = useActivityLogs();

  return (
    <AppLayout title="Histórico">
      <div className="content-premium space-premium">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Histórico de Atividades</h2>
          <p className="text-muted-foreground">
            Acompanhe todas as ações realizadas na sua conta.
          </p>
        </div>

        {/* Activity List */}
        <PremiumFrame title="Atividades — Nexia Suite" className="fade-in">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary icon-glow-subtle" />
            <h3 className="text-lg font-semibold text-foreground">Atividades Recentes</h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <History className="h-8 w-8 text-primary icon-glow-subtle" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma atividade</h3>
              <p className="text-muted-foreground max-w-md">
                As atividades realizadas aparecerão aqui conforme você usa a plataforma.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-primary/20" />

              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="relative flex gap-4 pl-10">
                    {/* Icon circle */}
                    <div className={`absolute left-0 p-2 rounded-full border ${getActivityColor(log.type)}`}>
                      {getActivityIcon(log.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-0.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-foreground font-medium">{log.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground/50">•</span>
                        <span className="text-xs text-muted-foreground/70">
                          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </PremiumFrame>
      </div>
    </AppLayout>
  );
}
