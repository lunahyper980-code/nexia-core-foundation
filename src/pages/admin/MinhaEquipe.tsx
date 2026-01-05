import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/contexts/UserRoleContext';
import { Users, TrendingUp, DollarSign, Activity, Copy, Info } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for team members - in production, this would come from the database
const teamMembers = [
  { id: 1, name: 'Ana Silva', status: 'active', volume: 4500, joinedAt: '2025-11-15' },
  { id: 2, name: 'Carlos Oliveira', status: 'active', volume: 3200, joinedAt: '2025-12-01' },
  { id: 3, name: 'Mariana Santos', status: 'active', volume: 2800, joinedAt: '2025-12-10' },
];

const teamStats = {
  activeMembers: 3,
  totalVolume: 10500,
  averageTicket: 3500,
  status: 'Ativa',
};

const promoLink = 'https://nexia.app/promo/equipe-interna-2025';

export default function MinhaEquipe() {
  const { isAdminOrOwner, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdminOrOwner) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdminOrOwner, loading, navigate]);

  const copyPromoLink = () => {
    navigator.clipboard.writeText(promoLink);
    toast.success('Link copiado para a área de transferência');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <AppLayout title="Minha Equipe">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdminOrOwner) {
    return null;
  }

  return (
    <AppLayout title="Minha Equipe">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Minha Equipe</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral da equipe vinculada a este acesso
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Membros ativos</p>
                  <p className="text-2xl font-bold text-foreground">{teamStats.activeMembers}</p>
                </div>
                <Users className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Volume total</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(teamStats.totalVolume)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-success/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ticket médio</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(teamStats.averageTicket)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Status da equipe</p>
                  <p className="text-2xl font-bold text-success">{teamStats.status}</p>
                </div>
                <Activity className="h-8 w-8 text-success/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lista da Equipe
            </CardTitle>
            <CardDescription>
              Membros vinculados a este acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Entrada em {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatCurrency(member.volume)}</p>
                      <p className="text-xs text-muted-foreground">volume gerado</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Ativo
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Promotional Link Section */}
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader>
            <CardTitle className="text-lg">Acesso Promocional da Equipe</CardTitle>
            <CardDescription>
              Este acesso é destinado a pessoas vinculadas à equipe. O valor promocional existe como benefício de entrada e acompanhamento inicial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Plano Mensal</p>
                <p className="text-2xl font-bold text-foreground mt-1">R$ 197</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Plano Vitalício</p>
                <p className="text-2xl font-bold text-foreground mt-1">R$ 297</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Link de acesso</p>
                <p className="text-sm font-mono text-foreground truncate">{promoLink}</p>
              </div>
              <Button onClick={copyPromoLink} className="shrink-0">
                <Copy className="h-4 w-4 mr-2" />
                Copiar link de acesso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Context Notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Esta área é administrativa e não representa funcionalidades públicas da plataforma.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
