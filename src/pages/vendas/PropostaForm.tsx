import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Loader2, Copy, FileText, Brain, Layers, Info, User } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const serviceTypes = [
  { value: 'site', label: 'Site' },
  { value: 'app', label: 'Aplicativo' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'pacote', label: 'Pacote simples' },
  { value: 'outro', label: 'Outro' },
];

const originOptions = [
  { value: 'manual', label: 'Nenhuma (manual)' },
  { value: 'nexia', label: 'Planejamento Nexia' },
  { value: 'project', label: 'Solução Digital' },
  { value: 'outro', label: 'Outro' },
];

interface FormData {
  prospect_name: string;
  prospect_phone: string;
  prospect_email: string;
  planning_id: string | null;
  project_id: string | null;
  title: string;
  service_type: string;
  custom_service_type: string;
  description: string;
  deliverables: string;
  estimated_deadline: string;
  total_value: string;
  payment_terms: string;
  observations: string;
  status: string;
  custom_origin: string;
}

export default function PropostaForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<FormData>({
    prospect_name: '',
    prospect_phone: '',
    prospect_email: '',
    planning_id: searchParams.get('planningId') || null,
    project_id: searchParams.get('projectId') || null,
    title: '',
    service_type: 'site',
    custom_service_type: '',
    description: '',
    deliverables: '',
    estimated_deadline: '',
    total_value: '',
    payment_terms: '',
    observations: '',
    status: 'draft',
    custom_origin: '',
  });

  const [origin, setOrigin] = useState<'manual' | 'nexia' | 'project' | 'outro'>('manual');

  // Fetch existing proposal if editing
  const { data: proposal, isLoading: loadingProposal } = useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch plannings for selection
  const { data: plannings } = useQuery({
    queryKey: ['plannings-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('nexia_plannings')
        .select('id, name, client_id, strategy_summary, focus_area')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Fetch projects for selection
  const { data: projects } = useQuery({
    queryKey: ['projects-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('id, app_name, main_benefit, target_platform')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Load proposal data when editing
  useEffect(() => {
    if (proposal) {
      setFormData({
        prospect_name: (proposal as any).prospect_name || '',
        prospect_phone: (proposal as any).prospect_phone || '',
        prospect_email: (proposal as any).prospect_email || '',
        planning_id: proposal.planning_id || null,
        project_id: proposal.project_id || null,
        title: proposal.title || '',
        service_type: proposal.service_type || 'site',
        custom_service_type: (proposal as any).custom_service_type || '',
        description: proposal.description || '',
        deliverables: proposal.deliverables || '',
        estimated_deadline: proposal.estimated_deadline || '',
        total_value: proposal.total_value?.toString() || '',
        payment_terms: proposal.payment_terms || '',
        observations: proposal.observations || '',
        status: proposal.status || 'draft',
        custom_origin: (proposal as any).custom_origin || '',
      });
      
      if ((proposal as any).custom_origin) setOrigin('outro');
      else if (proposal.planning_id) setOrigin('nexia');
      else if (proposal.project_id) setOrigin('project');
    }
  }, [proposal]);

  // Pre-fill from Nexia planning
  useEffect(() => {
    const planningId = searchParams.get('planningId');
    if (planningId && plannings) {
      const planning = plannings.find((p) => p.id === planningId);
      if (planning) {
        setOrigin('nexia');
        setFormData((prev) => ({
          ...prev,
          planning_id: planningId,
          title: `Proposta - ${planning.name}`,
          description: planning.strategy_summary || '',
        }));
      }
    }
  }, [searchParams, plannings]);

  // Pre-fill from project
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && projects) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setOrigin('project');
        setFormData((prev) => ({
          ...prev,
          project_id: projectId,
          title: `Proposta - ${project.app_name}`,
          description: project.main_benefit || '',
          service_type: project.target_platform === 'web' ? 'site' : 'app',
        }));
      }
    }
  }, [searchParams, projects]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!workspace?.id || !formData.prospect_name) {
        throw new Error('Nome do prospecto é obrigatório');
      }

      const payload = {
        workspace_id: workspace.id,
        client_id: null, // Não usamos mais client_id direto
        prospect_name: formData.prospect_name,
        prospect_phone: formData.prospect_phone || null,
        prospect_email: formData.prospect_email || null,
        planning_id: formData.planning_id || null,
        project_id: formData.project_id || null,
        title: formData.title,
        service_type: formData.service_type,
        custom_service_type: formData.service_type === 'outro' ? formData.custom_service_type : null,
        description: formData.description || null,
        deliverables: formData.deliverables || null,
        estimated_deadline: formData.estimated_deadline || null,
        total_value: formData.total_value ? parseFloat(formData.total_value) : null,
        payment_terms: formData.payment_terms || null,
        observations: formData.observations || null,
        status: formData.status,
        custom_origin: origin === 'outro' ? formData.custom_origin : null,
        created_by_user_id: user?.id || null,
      };

      if (isEditing && id) {
        const { error } = await supabase.from('proposals').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('proposals').insert(payload);
        if (error) throw error;

        // Log activity
        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          type: 'PROPOSAL_CREATED',
          message: `Proposta "${formData.title}" criada`,
          metadata: {
            prospect_name: formData.prospect_name,
            planning_id: formData.planning_id,
            project_id: formData.project_id,
            service_type: formData.service_type,
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['real-metrics'] });
      toast.success(isEditing ? 'Proposta atualizada' : 'Proposta criada');
      navigate('/vendas/propostas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar proposta');
    },
  });

  const handleCopyText = () => {
    const text = `
PROPOSTA COMERCIAL

${formData.title}

Cliente: ${formData.prospect_name || '-'}

Descrição do Serviço:
${formData.description || '-'}

O que será entregue:
${formData.deliverables || '-'}

Prazo estimado: ${formData.estimated_deadline || '-'}

Valor: ${formData.total_value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.total_value)) : '-'}

Forma de pagamento:
${formData.payment_terms || '-'}

${formData.observations ? `Observações:\n${formData.observations}` : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Proposta copiada');

    // Log activity
    if (workspace?.id) {
      supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'PROPOSAL_EXPORTED',
        message: `Proposta "${formData.title}" copiada`,
      });
    }
  };

  if (loadingProposal) {
    return (
      <AppLayout title="Proposta">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isEditing ? 'Editar Proposta' : 'Nova Proposta'}>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vendas/propostas')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? 'Editar Proposta' : 'Nova Proposta'}
            </h2>
            <p className="text-muted-foreground">
              Preencha os dados para gerar uma proposta profissional.
            </p>
          </div>
        </div>

        {/* Origin indicator */}
        {origin !== 'manual' && origin !== 'outro' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            {origin === 'nexia' ? (
              <Brain className="h-4 w-4 text-primary" />
            ) : (
              <Layers className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm text-foreground">
              {origin === 'nexia'
                ? 'Proposta gerada com base no planejamento Nexia'
                : 'Proposta gerada com base no projeto criado'}
            </span>
            <Info className="h-4 w-4 text-muted-foreground ml-auto" />
          </div>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados do Prospecto
            </CardTitle>
            <CardDescription>
              Informe os dados de quem receberá a proposta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prospect Name */}
            <div className="space-y-2">
              <Label>Nome do Prospecto / Empresa *</Label>
              <Input
                value={formData.prospect_name}
                onChange={(e) => setFormData({ ...formData, prospect_name: e.target.value })}
                placeholder="Ex: João da Silva ou Empresa XYZ"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Prospect Phone */}
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input
                  value={formData.prospect_phone}
                  onChange={(e) => setFormData({ ...formData, prospect_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* Prospect Email */}
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.prospect_email}
                  onChange={(e) => setFormData({ ...formData, prospect_email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações da Proposta</CardTitle>
            <CardDescription>
              Todos os campos podem ser editados livremente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Origin Selection */}
            <div className="space-y-2">
              <Label>Origem (opcional)</Label>
              <Select
                value={origin}
                onValueChange={(value: 'manual' | 'nexia' | 'project' | 'outro') => {
                  setOrigin(value);
                  if (value === 'manual' || value === 'outro') {
                    setFormData({ ...formData, planning_id: null, project_id: null });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {originOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Origin Field */}
            {origin === 'outro' && (
              <div className="space-y-2">
                <Label>Especifique a origem</Label>
                <Input
                  value={formData.custom_origin}
                  onChange={(e) => setFormData({ ...formData, custom_origin: e.target.value })}
                  placeholder="Ex: Indicação, Instagram, Google, etc."
                />
              </div>
            )}

            {origin === 'nexia' && plannings && plannings.length > 0 && (
              <div className="space-y-2">
                <Label>Planejamento Nexia</Label>
                <Select
                  value={formData.planning_id || ''}
                  onValueChange={(value) => {
                    const planning = plannings.find((p) => p.id === value);
                    setFormData({
                      ...formData,
                      planning_id: value,
                      title: planning ? `Proposta - ${planning.name}` : formData.title,
                      description: planning?.strategy_summary || formData.description,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um planejamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {plannings.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {origin === 'project' && projects && projects.length > 0 && (
              <div className="space-y-2">
                <Label>Solução Digital</Label>
                <Select
                  value={formData.project_id || ''}
                  onValueChange={(value) => {
                    const project = projects.find((p) => p.id === value);
                    setFormData({
                      ...formData,
                      project_id: value,
                      title: project ? `Proposta - ${project.app_name}` : formData.title,
                      description: project?.main_benefit || formData.description,
                      service_type: project?.target_platform === 'web' ? 'site' : 'app',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.app_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Service Type */}
            <div className="space-y-2">
              <Label>Tipo de Serviço *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Service Type Field */}
            {formData.service_type === 'outro' && (
              <div className="space-y-2">
                <Label>Especifique o tipo de serviço</Label>
                <Input
                  value={formData.custom_service_type}
                  onChange={(e) => setFormData({ ...formData, custom_service_type: e.target.value })}
                  placeholder="Ex: Consultoria, Mentoria, Automação, etc."
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label>Título da Proposta *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Proposta de desenvolvimento de site"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descrição do Serviço</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o serviço que será prestado..."
                rows={4}
              />
            </div>

            {/* Deliverables */}
            <div className="space-y-2">
              <Label>O que será entregue</Label>
              <Textarea
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                placeholder="Liste os itens que serão entregues..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Deadline */}
              <div className="space-y-2">
                <Label>Prazo Estimado</Label>
                <Input
                  value={formData.estimated_deadline}
                  onChange={(e) => setFormData({ ...formData, estimated_deadline: e.target.value })}
                  placeholder="Ex: 30 dias"
                />
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input
                  type="number"
                  value={formData.total_value}
                  onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Payment Terms */}
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Textarea
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="Ex: 50% na assinatura, 50% na entrega"
                rows={2}
              />
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Notas adicionais..."
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                  <SelectItem value="accepted">Aceita</SelectItem>
                  <SelectItem value="rejected">Recusada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !formData.title || !formData.prospect_name}
            className="gap-2"
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Proposta'}
          </Button>
          <Button variant="outline" onClick={handleCopyText} className="gap-2">
            <Copy className="h-4 w-4" />
            Copiar Texto
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
