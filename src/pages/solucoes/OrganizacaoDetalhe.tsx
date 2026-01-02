import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Network, 
  Eye,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle2,
  Route,
  FileText,
  FileSignature,
  Trash2,
  Loader2,
  Calendar,
  Download,
  Save
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

interface PremiumCardProps {
  icon: React.ElementType;
  title: string;
  content: string | null;
  iconColor: string;
  glowColor: string;
}

function PremiumCard({ icon: Icon, title, content, iconColor, glowColor }: PremiumCardProps) {
  if (!content) return null;
  
  return (
    <div className={`relative rounded-2xl border border-primary/10 bg-gradient-to-br from-background via-background to-primary/[0.02] overflow-hidden`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${glowColor} blur-3xl`} />
      
      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconColor.replace('text-', 'bg-')}/10 flex items-center justify-center border border-primary/10`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        </div>
        
        {/* Text content */}
        <div className="prose prose-sm max-w-none">
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RoutineCardProps {
  icon: React.ElementType;
  title: string;
  content: string | null;
  iconColor: string;
  glowColor: string;
  badge?: string;
}

function RoutineCard({ icon: Icon, title, content, iconColor, glowColor, badge }: RoutineCardProps) {
  if (!content) return null;

  // Parse content into sections
  const sections = content.split(/\n\n+/).filter(Boolean);
  
  return (
    <div className={`relative rounded-2xl border border-primary/10 bg-gradient-to-br from-background via-background to-primary/[0.02] overflow-hidden`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${glowColor} blur-3xl`} />
      
      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${iconColor.replace('text-', 'bg-')}/10 flex items-center justify-center border border-primary/10`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
          </div>
          {badge && (
            <Badge variant="outline" className="text-xs border-primary/20 text-primary">
              {badge}
            </Badge>
          )}
        </div>
        
        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => {
            const lines = section.split('\n');
            const sectionTitle = lines[0]?.includes(':') ? lines[0].split(':')[0] : null;
            const sectionContent = sectionTitle ? lines.slice(0).join('\n') : section;
            
            return (
              <div key={index} className="p-4 rounded-xl bg-primary/[0.03] border border-primary/5">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {sectionContent}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OrganizacaoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: organization, isLoading } = useQuery({
    queryKey: ['process-organization', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('process_organizations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('process_organizations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['process-organizations'] });
      
      toast({
        title: 'Organização excluída',
        description: 'A organização foi removida com sucesso.'
      });
      
      navigate('/solucoes/organizacao');
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a organização.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Carregando...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!organization) {
    return (
      <AppLayout title="Não encontrado">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Organização não encontrada.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/solucoes/organizacao')}
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isCompleted = organization.status === 'completed';

  return (
    <>
      <AppLayout title="Organização de Processos">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/solucoes/organizacao')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-amber-500" />
                <h1 className="text-xl font-bold text-foreground">{organization.business_type}</h1>
                <Badge className={isCompleted ? 'bg-success/10 text-success' : 'bg-muted'}>
                  {isCompleted ? 'Concluído' : 'Rascunho'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Criado em {format(new Date(organization.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Business Info Summary */}
          <div className="p-4 rounded-xl border border-primary/10 bg-primary/[0.02]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Equipe</p>
                <p className="font-medium text-foreground">{organization.team_size || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Canais</p>
                <p className="font-medium text-foreground">{organization.contact_channels || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Objetivo</p>
                <p className="font-medium text-foreground truncate">{organization.organization_goal || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">{isCompleted ? 'Gerado' : 'Pendente'}</p>
              </div>
            </div>
          </div>

          {/* Generated Content */}
          {isCompleted ? (
            <div className="space-y-6">
              {/* Premium Cards */}
              <PremiumCard 
                icon={Eye}
                title="Visão Geral da Operação"
                content={organization.operation_overview}
                iconColor="text-primary"
                glowColor="from-primary/20 to-transparent"
              />
              
              <PremiumCard 
                icon={AlertTriangle}
                title="Principais Problemas de Processo"
                content={organization.process_problems}
                iconColor="text-destructive"
                glowColor="from-destructive/20 to-transparent"
              />
              
              <PremiumCard 
                icon={Route}
                title="Fluxo Ideal de Atendimento"
                content={organization.ideal_flow}
                iconColor="text-success"
                glowColor="from-success/20 to-transparent"
              />
              
              <PremiumCard 
                icon={Users}
                title="Organização Interna"
                content={organization.internal_organization}
                iconColor="text-blue-500"
                glowColor="from-blue-500/20 to-transparent"
              />
              
              <RoutineCard 
                icon={Clock}
                title="Rotina Recomendada"
                content={organization.recommended_routine}
                iconColor="text-amber-500"
                glowColor="from-amber-500/20 to-transparent"
                badge="Diária e Semanal"
              />
              
              <PremiumCard 
                icon={CheckCircle2}
                title="Pontos de Atenção e Melhoria"
                content={organization.attention_points}
                iconColor="text-purple-500"
                glowColor="from-purple-500/20 to-transparent"
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-primary/10">
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Visualizar Completo
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/solucoes/proposta/novo?organizacao=${id}`)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Gerar Proposta
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/solucoes/contrato/novo?organizacao=${id}`)}
                  className="gap-2"
                >
                  <FileSignature className="h-4 w-4" />
                  Gerar Contrato
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDelete(true)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Processo
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/20 p-8 text-center">
              <Network className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-medium mb-2">Organização não gerada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete o formulário para gerar a estrutura de processos.
              </p>
              <Button onClick={() => navigate('/solucoes/organizacao/novo')} className="bg-amber-500 hover:bg-amber-600">
                Gerar Organização
              </Button>
            </div>
          )}
        </div>
      </AppLayout>

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Excluir organização"
        description={`Tem certeza que deseja excluir a organização de "${organization.business_type}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />
    </>
  );
}
