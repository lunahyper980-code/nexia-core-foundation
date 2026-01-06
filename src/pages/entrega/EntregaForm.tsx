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
import { ArrowLeft, Save, Loader2, Copy, FileText, Brain, Layers, Info } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleState } from '@/hooks/useModuleState';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';

const deliveryTypes = [
  { value: 'site', label: 'Site' },
  { value: 'app', label: 'Aplicativo' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'page', label: 'Página simples' },
  { value: 'material', label: 'Material digital' },
  { value: 'other', label: 'Outro' },
];

interface FormData {
  client_id: string;
  proposal_id: string | null;
  planning_id: string | null;
  project_id: string | null;
  title: string;
  delivery_type: string;
  description: string;
  delivery_date: string;
  links: string;
  observations: string;
  next_steps: string;
  status: string;
}

export default function EntregaForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const { clients } = useClients();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { getSavedState, saveFormData, clearState } = useModuleState('entrega-form');
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    client_id: searchParams.get('clientId') || '',
    proposal_id: searchParams.get('proposalId') || null,
    planning_id: searchParams.get('planningId') || null,
    project_id: searchParams.get('projectId') || null,
    title: '',
    delivery_type: 'site',
    description: '',
    delivery_date: new Date().toISOString().split('T')[0],
    links: '',
    observations: '',
    next_steps: '',
    status: 'delivered',
  });

  const [origin, setOrigin] = useState<'manual' | 'proposal' | 'nexia' | 'project' | 'launch_kit' | 'positioning' | 'authority' | 'organization' | 'diagnosis'>('manual');

  // Check for saved state on mount (only if not editing and no URL params)
  useEffect(() => {
    if (isEditing || searchParams.get('clientId') || searchParams.get('proposalId') || searchParams.get('planningId') || searchParams.get('projectId')) return;
    const saved = getSavedState();
    if (saved && saved.formData && Object.keys(saved.formData).length > 0) {
      setShowResumeBanner(true);
    }
  }, [isEditing]);

  const handleResumeSession = () => {
    const saved = getSavedState();
    if (saved && saved.formData) {
      setFormData(prev => ({ ...prev, ...saved.formData }));
    }
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    clearState();
    setShowResumeBanner(false);
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      if (!isEditing) {
        saveFormData(updated);
      }
      return updated;
    });
  };

  // Fetch existing delivery if editing
  const { data: delivery, isLoading: loadingDelivery } = useQuery({
    queryKey: ['delivery', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch proposals
  const { data: proposals } = useQuery({
    queryKey: ['proposals-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('proposals')
        .select('id, title, client_id, service_type, description')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Fetch plannings
  const { data: plannings } = useQuery({
    queryKey: ['plannings-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('nexia_plannings')
        .select('id, name, client_id, focus_area')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ['projects-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('id, app_name, target_platform')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Fetch launch kits
  const { data: launchKits } = useQuery({
    queryKey: ['launch-kits-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('launch_kits')
        .select('id, business_name, project_type')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Fetch positionings
  const { data: positionings } = useQuery({
    queryKey: ['positionings-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('digital_positionings')
        .select('id, company_name, segment')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Fetch authority strategies
  const { data: authorityStrategies } = useQuery({
    queryKey: ['authority-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('authority_strategies')
        .select('id, business_name, segment')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Fetch process organizations
  const { data: processOrganizations } = useQuery({
    queryKey: ['organizations-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('process_organizations')
        .select('id, business_type')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Fetch diagnoses
  const { data: diagnoses } = useQuery({
    queryKey: ['diagnoses-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('digital_diagnoses')
        .select('id, company_name, segment')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Load delivery data when editing
  useEffect(() => {
    if (delivery) {
      setFormData({
        client_id: delivery.client_id || '',
        proposal_id: delivery.proposal_id || null,
        planning_id: delivery.planning_id || null,
        project_id: delivery.project_id || null,
        title: delivery.title || '',
        delivery_type: delivery.delivery_type || 'site',
        description: delivery.description || '',
        delivery_date: delivery.delivery_date || new Date().toISOString().split('T')[0],
        links: delivery.links || '',
        observations: delivery.observations || '',
        next_steps: delivery.next_steps || '',
        status: delivery.status || 'delivered',
      });
      if (delivery.proposal_id) setOrigin('proposal');
      else if (delivery.planning_id) setOrigin('nexia');
      else if (delivery.project_id) setOrigin('project');
    }
  }, [delivery]);

  // Pre-fill from URL params
  useEffect(() => {
    const proposalId = searchParams.get('proposalId');
    if (proposalId && proposals) {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (proposal) {
        setOrigin('proposal');
        setFormData((prev) => ({
          ...prev,
          client_id: proposal.client_id || prev.client_id,
          proposal_id: proposalId,
          title: `Entrega - ${proposal.title}`,
          description: proposal.description || '',
          delivery_type: proposal.service_type === 'app' ? 'app' : proposal.service_type === 'landing' ? 'landing' : 'site',
        }));
      }
    }

    const planningId = searchParams.get('planningId');
    if (planningId && plannings) {
      const planning = plannings.find((p) => p.id === planningId);
      if (planning) {
        setOrigin('nexia');
        setFormData((prev) => ({
          ...prev,
          client_id: planning.client_id || prev.client_id,
          planning_id: planningId,
          title: `Entrega - ${planning.name}`,
        }));
      }
    }

    const projectId = searchParams.get('projectId');
    if (projectId && projects) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setOrigin('project');
        setFormData((prev) => ({
          ...prev,
          project_id: projectId,
          title: `Entrega - ${project.app_name}`,
          delivery_type: project.target_platform === 'web' ? 'site' : 'app',
        }));
      }
    }
  }, [searchParams, proposals, plannings, projects]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!workspace?.id || !formData.client_id) {
        throw new Error('Cliente é obrigatório');
      }
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }

      const payload = {
        workspace_id: workspace.id,
        client_id: formData.client_id,
        proposal_id: formData.proposal_id || null,
        planning_id: formData.planning_id || null,
        project_id: formData.project_id || null,
        title: formData.title.trim(),
        delivery_type: formData.delivery_type,
        description: formData.description || null,
        delivery_date: formData.delivery_date,
        links: formData.links || null,
        observations: formData.observations || null,
        next_steps: formData.next_steps || null,
        status: formData.status,
        created_by_user_id: user?.id || null,
      };

      if (isEditing && id) {
        const { error } = await supabase.from('deliveries').update(payload).eq('id', id);
        if (error) throw error;

        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          type: 'DELIVERY_UPDATED',
          message: `Entrega "${formData.title}" atualizada`,
          entity_id: id,
          entity_type: 'delivery',
        });
      } else {
        const { error } = await supabase.from('deliveries').insert(payload);
        if (error) throw error;

        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          type: 'DELIVERY_CREATED',
          message: `Entrega "${formData.title}" criada`,
          metadata: {
            client_id: formData.client_id,
            delivery_type: formData.delivery_type,
            proposal_id: formData.proposal_id,
            planning_id: formData.planning_id,
            project_id: formData.project_id,
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries-stats'] });
      clearState();
      toast.success(isEditing ? 'Entrega atualizada' : 'Entrega registrada');
      navigate('/entrega');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar entrega');
    },
  });

  const handleCopyText = () => {
    const client = clients.find((c) => c.id === formData.client_id);
    const deliveryTypeLabel = deliveryTypes.find((t) => t.value === formData.delivery_type)?.label || formData.delivery_type;
    
    const text = `
RESUMO DA ENTREGA

${formData.title}

Cliente: ${client?.name || '-'}
Tipo: ${deliveryTypeLabel}
Data: ${new Date(formData.delivery_date).toLocaleDateString('pt-BR')}

Descrição:
${formData.description || '-'}

${formData.links ? `Links:\n${formData.links}` : ''}

${formData.observations ? `Observações:\n${formData.observations}` : ''}

${formData.next_steps ? `Próximos passos:\n${formData.next_steps}` : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Resumo copiado');

    if (workspace?.id) {
      supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'DELIVERY_EXPORTED',
        message: `Resumo da entrega "${formData.title}" copiado`,
      });
    }
  };

  const getOriginLabel = () => {
    if (origin === 'proposal' && formData.proposal_id) {
      const proposal = proposals?.find((p) => p.id === formData.proposal_id);
      return proposal ? `Entrega relacionada à proposta "${proposal.title}"` : 'Entrega relacionada a uma proposta';
    }
    if (origin === 'nexia' && formData.planning_id) {
      const planning = plannings?.find((p) => p.id === formData.planning_id);
      return planning ? `Entrega baseada no planejamento Nexia "${planning.name}"` : 'Entrega baseada em planejamento Nexia';
    }
    if (origin === 'project' && formData.project_id) {
      const project = projects?.find((p) => p.id === formData.project_id);
      return project ? `Entrega do projeto "${project.app_name}"` : 'Entrega de solução digital';
    }
    return null;
  };

  if (loadingDelivery) {
    return (
      <AppLayout title="Entrega">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isEditing ? 'Editar Entrega' : 'Nova Entrega'}>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/entrega')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? 'Editar Entrega' : 'Nova Entrega'}
            </h2>
            <p className="text-muted-foreground">
              Registre o que foi finalizado e entregue ao cliente.
            </p>
          </div>
        </div>

        {/* Resume Session Banner */}
        {showResumeBanner && (
          <ResumeSessionBanner
            title="Continuar de onde parou?"
            description="Você tem um rascunho de entrega salvo"
            onResume={handleResumeSession}
            onStartFresh={handleStartFresh}
          />
        )}

        {/* Origin indicator */}
        {getOriginLabel() && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            {origin === 'proposal' && <FileText className="h-4 w-4 text-primary" />}
            {origin === 'nexia' && <Brain className="h-4 w-4 text-primary" />}
            {origin === 'project' && <Layers className="h-4 w-4 text-primary" />}
            <span className="text-sm text-foreground">{getOriginLabel()}</span>
            <Info className="h-4 w-4 text-muted-foreground ml-auto" />
          </div>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações da Entrega</CardTitle>
            <CardDescription>
              Serve para organização e histórico do que foi entregue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => updateFormData({ client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Origin Selection */}
            <div className="space-y-2">
              <Label>Origem (opcional)</Label>
              <Select
                value={origin}
                onValueChange={(value: 'manual' | 'proposal' | 'nexia' | 'project' | 'launch_kit' | 'positioning' | 'authority' | 'organization' | 'diagnosis') => {
                  setOrigin(value);
                  if (value === 'manual') {
                    setFormData({ ...formData, proposal_id: null, planning_id: null, project_id: null });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Nenhuma (manual)</SelectItem>
                  <SelectItem value="proposal">Proposta</SelectItem>
                  <SelectItem value="nexia">Planejamento Nexia</SelectItem>
                  <SelectItem value="project">Site ou Aplicativo</SelectItem>
                  <SelectItem value="launch_kit">Kit de Lançamento</SelectItem>
                  <SelectItem value="positioning">Posicionamento Digital</SelectItem>
                  <SelectItem value="authority">Autoridade Digital</SelectItem>
                  <SelectItem value="organization">Organização de Processos</SelectItem>
                  <SelectItem value="diagnosis">Diagnóstico Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {origin === 'proposal' && proposals && proposals.length > 0 && (
              <div className="space-y-2">
                <Label>Proposta</Label>
                <Select
                  value={formData.proposal_id || ''}
                  onValueChange={(value) => {
                    const proposal = proposals.find((p) => p.id === value);
                    setFormData({
                      ...formData,
                      proposal_id: value,
                      client_id: proposal?.client_id || formData.client_id,
                      title: proposal ? `Entrega - ${proposal.title}` : formData.title,
                      description: proposal?.description || formData.description,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma proposta" />
                  </SelectTrigger>
                  <SelectContent>
                    {proposals.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      client_id: planning?.client_id || formData.client_id,
                      title: planning ? `Entrega - ${planning.name}` : formData.title,
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
                      title: project ? `Entrega - ${project.app_name}` : formData.title,
                      delivery_type: project?.target_platform === 'web' ? 'site' : 'app',
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

            {origin === 'launch_kit' && launchKits && launchKits.length > 0 && (
              <div className="space-y-2">
                <Label>Kit de Lançamento</Label>
                <Select
                  value={formData.project_id || ''}
                  onValueChange={(value) => {
                    const kit = launchKits.find((k) => k.id === value);
                    setFormData({
                      ...formData,
                      project_id: value,
                      title: kit ? `Entrega - Kit ${kit.business_name}` : formData.title,
                      delivery_type: 'material',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um kit de lançamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {launchKits.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.business_name} ({k.project_type || 'Kit'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {origin === 'positioning' && positionings && positionings.length > 0 && (
              <div className="space-y-2">
                <Label>Posicionamento Digital</Label>
                <Select
                  value={formData.project_id || ''}
                  onValueChange={(value) => {
                    const pos = positionings.find((p) => p.id === value);
                    setFormData({
                      ...formData,
                      project_id: value,
                      title: pos ? `Entrega - Posicionamento ${pos.company_name}` : formData.title,
                      delivery_type: 'material',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um posicionamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {positionings.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.company_name} - {p.segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {origin === 'authority' && authorityStrategies && authorityStrategies.length > 0 && (
              <div className="space-y-2">
                <Label>Autoridade Digital</Label>
                <Select
                  value={formData.project_id || ''}
                  onValueChange={(value) => {
                    const auth = authorityStrategies.find((a) => a.id === value);
                    setFormData({
                      ...formData,
                      project_id: value,
                      title: auth ? `Entrega - Autoridade ${auth.business_name}` : formData.title,
                      delivery_type: 'material',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma estratégia de autoridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {authorityStrategies.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.business_name} - {a.segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {origin === 'organization' && processOrganizations && processOrganizations.length > 0 && (
              <div className="space-y-2">
                <Label>Organização de Processos</Label>
                <Select
                  value={formData.project_id || ''}
                  onValueChange={(value) => {
                    const org = processOrganizations.find((o) => o.id === value);
                    setFormData({
                      ...formData,
                      project_id: value,
                      title: org ? `Entrega - Organização ${org.business_type}` : formData.title,
                      delivery_type: 'material',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma organização de processos" />
                  </SelectTrigger>
                  <SelectContent>
                    {processOrganizations.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.business_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {origin === 'diagnosis' && diagnoses && diagnoses.length > 0 && (
              <div className="space-y-2">
                <Label>Diagnóstico Digital</Label>
                <Select
                  value={formData.project_id || ''}
                  onValueChange={(value) => {
                    const diag = diagnoses.find((d) => d.id === value);
                    setFormData({
                      ...formData,
                      project_id: value,
                      title: diag ? `Entrega - Diagnóstico ${diag.company_name}` : formData.title,
                      delivery_type: 'material',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um diagnóstico" />
                  </SelectTrigger>
                  <SelectContent>
                    {diagnoses.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.company_name} - {d.segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Delivery Type */}
            <div className="space-y-2">
              <Label>Tipo de Entrega *</Label>
              <Select
                value={formData.delivery_type}
                onValueChange={(value) => updateFormData({ delivery_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deliveryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Título da Entrega *</Label>
              <Input
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Ex: Site institucional - Empresa ABC"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descrição do que foi entregue *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Descreva o que foi entregue ao cliente..."
                rows={4}
              />
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label>Data da Entrega *</Label>
              <Input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => updateFormData({ delivery_date: e.target.value })}
              />
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Label>Links</Label>
              <Textarea
                value={formData.links}
                onChange={(e) => updateFormData({ links: e.target.value })}
                placeholder="Cole aqui os links do site, app, Lovable, Drive, Figma, etc."
                rows={3}
              />
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label>Observações finais</Label>
              <Textarea
                value={formData.observations}
                onChange={(e) => updateFormData({ observations: e.target.value })}
                placeholder="Notas sobre a entrega..."
                rows={3}
              />
            </div>

            {/* Next Steps */}
            <div className="space-y-2">
              <Label>Próximos passos sugeridos</Label>
              <Textarea
                value={formData.next_steps}
                onChange={(e) => updateFormData({ next_steps: e.target.value })}
                placeholder="Sugestões para o cliente após a entrega..."
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="pending_adjustments">Ajustes pendentes</SelectItem>
                  <SelectItem value="finalized">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !formData.title || !formData.client_id}
            className="gap-2"
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            {isEditing ? 'Salvar Alterações' : 'Registrar Entrega'}
          </Button>
          <Button variant="outline" onClick={handleCopyText} className="gap-2">
            <Copy className="h-4 w-4" />
            Copiar Resumo
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
