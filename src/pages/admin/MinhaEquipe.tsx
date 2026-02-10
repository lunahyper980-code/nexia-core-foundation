import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useTeamMetrics } from '@/hooks/useTeamMetrics';
import { TrendingUp, Users, Sparkles } from 'lucide-react';
import { EquipePerformance } from '@/components/equipe/EquipePerformance';
import { EquipeMembros } from '@/components/equipe/EquipeMembros';
import { EquipeAcessoPromocional } from '@/components/equipe/EquipeAcessoPromocional';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'performance', label: 'Performance da Equipe', icon: TrendingUp },
  { id: 'membros', label: 'Membros da Equipe', icon: Users },
  { id: 'promo', label: 'Acesso Promocional', icon: Sparkles },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function MinhaEquipe() {
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();
  const { teamData, loading: metricsLoading } = useTeamMetrics();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('performance');

  const loading = roleLoading || metricsLoading;

  useEffect(() => {
    if (!loading && !isAdminOrOwner) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdminOrOwner, loading, navigate]);

  if (loading || !teamData) {
    return (
      <AppLayout title="Minha Equipe">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdminOrOwner) return null;

  return (
    <AppLayout title="Minha Equipe">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Minha Equipe</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie sua equipe, acompanhe performance e compartilhe acessos
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border/50 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center',
                  isActive
                    ? 'bg-background text-foreground shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'performance' && <EquipePerformance teamData={teamData} />}
        {activeTab === 'membros' && <EquipeMembros teamData={teamData} />}
        {activeTab === 'promo' && <EquipeAcessoPromocional />}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-2">
          Esta área é administrativa • Dados atualizados automaticamente
        </p>
      </div>
    </AppLayout>
  );
}
