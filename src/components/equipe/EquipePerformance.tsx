import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import type { TeamData } from '@/hooks/useTeamMetrics';

interface EquipePerformanceProps {
  teamData: TeamData;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function EquipePerformance({ teamData }: EquipePerformanceProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Membros ativos</p>
                <p className="text-2xl font-bold text-foreground">{teamData.stats.activeMembers}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Colaboradores na equipe</p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Volume total gerado</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(teamData.stats.totalVolume)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ticket médio</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(teamData.stats.averageTicket)}</p>
              </div>
              <TrendingUp className="h-7 w-7 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Status da equipe</p>
                <p className="text-xl font-bold text-emerald-500">{teamData.stats.status}</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking / Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Ranking de Performance
          </CardTitle>
          <CardDescription>
            Volume individual e evolução contínua dos membros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamData.members.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-emerald-600">
                        {member.isGrowing ? 'Evoluindo esta semana' : 'Estável'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(member.volume)}</p>
                      <p className="text-[10px] text-muted-foreground">volume gerado</p>
                    </div>
                    <div className="text-right min-w-[45px]">
                      <p className="text-sm font-semibold text-emerald-600">{member.progress}%</p>
                    </div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${member.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
