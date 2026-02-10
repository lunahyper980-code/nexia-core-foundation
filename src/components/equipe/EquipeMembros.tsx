import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Mail, Phone } from 'lucide-react';
import type { TeamData } from '@/hooks/useTeamMetrics';
import { toast } from 'sonner';

interface EquipeMembrosProps {
  teamData: TeamData;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function EquipeMembros({ teamData }: EquipeMembrosProps) {
  const handleAddMember = () => {
    toast.info('Funcionalidade de adicionar membro em breve!');
  };

  return (
    <div className="space-y-6">
      {/* Header com botão */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Membros da Equipe</h2>
          <p className="text-sm text-muted-foreground">{teamData.stats.activeMembers} membros ativos</p>
        </div>
        <Button onClick={handleAddMember}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Membro
        </Button>
      </div>

      {/* Members Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {teamData.members.map((member) => (
          <Card key={member.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                  <span className="text-base font-semibold text-primary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Volume: {formatCurrency(member.volume)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      member.isGrowing
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {member.isGrowing ? '↑ Evoluindo' : '— Estável'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                      {member.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
