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
import { ArrowLeft, Save, Loader2, Copy } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  client_id: string;
  proposal_id: string | null;
  title: string;
  parties_identification: string;
  contract_object: string;
  service_scope: string;
  deadline: string;
  value_and_payment: string;
  responsibilities: string;
  cancellation_terms: string;
  jurisdiction: string;
  status: string;
}

const defaultContractTemplate = {
  parties_identification: `CONTRATANTE: [Nome/Razão Social], inscrito no CPF/CNPJ sob o nº [número], com endereço em [endereço completo].

CONTRATADA: [Nome da sua empresa], inscrita no CNPJ sob o nº [número], com sede em [endereço completo].`,
  contract_object: `O presente contrato tem por objeto a prestação de serviços de [descrever o serviço] conforme especificações acordadas entre as partes.`,
  service_scope: `Os serviços compreendem:
- [Item 1]
- [Item 2]
- [Item 3]`,
  responsibilities: `DA CONTRATADA:
- Executar os serviços conforme especificações acordadas
- Cumprir os prazos estabelecidos
- Manter comunicação clara sobre o andamento do projeto

DO CONTRATANTE:
- Fornecer informações e materiais necessários
- Realizar pagamentos conforme acordado
- Aprovar etapas dentro dos prazos estipulados`,
  cancellation_terms: `O presente contrato poderá ser rescindido por qualquer das partes mediante comunicação prévia de 15 (quinze) dias.

Em caso de rescisão, serão devidos os valores proporcionais aos serviços já executados.`,
  jurisdiction: `Fica eleito o Foro da Comarca de [cidade/estado] para dirimir quaisquer questões oriundas deste contrato.`,
};

export default function ContratoForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const { clients } = useClients();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<FormData>({
    client_id: searchParams.get('clientId') || '',
    proposal_id: searchParams.get('proposalId') || null,
    title: '',
    parties_identification: defaultContractTemplate.parties_identification,
    contract_object: defaultContractTemplate.contract_object,
    service_scope: defaultContractTemplate.service_scope,
    deadline: '',
    value_and_payment: '',
    responsibilities: defaultContractTemplate.responsibilities,
    cancellation_terms: defaultContractTemplate.cancellation_terms,
    jurisdiction: defaultContractTemplate.jurisdiction,
    status: 'draft',
  });

  // Fetch existing contract if editing
  const { data: contract, isLoading: loadingContract } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch proposals for selection
  const { data: proposals } = useQuery({
    queryKey: ['proposals-list', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('proposals')
        .select('id, title, client_id, description, deliverables, estimated_deadline, total_value, payment_terms')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Load contract data when editing
  useEffect(() => {
    if (contract) {
      setFormData({
        client_id: contract.client_id || '',
        proposal_id: contract.proposal_id || null,
        title: contract.title || '',
        parties_identification: contract.parties_identification || defaultContractTemplate.parties_identification,
        contract_object: contract.contract_object || defaultContractTemplate.contract_object,
        service_scope: contract.service_scope || defaultContractTemplate.service_scope,
        deadline: contract.deadline || '',
        value_and_payment: contract.value_and_payment || '',
        responsibilities: contract.responsibilities || defaultContractTemplate.responsibilities,
        cancellation_terms: contract.cancellation_terms || defaultContractTemplate.cancellation_terms,
        jurisdiction: contract.jurisdiction || defaultContractTemplate.jurisdiction,
        status: contract.status || 'draft',
      });
    }
  }, [contract]);

  // Pre-fill from proposal
  useEffect(() => {
    const proposalId = searchParams.get('proposalId');
    if (proposalId && proposals) {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (proposal) {
        const client = clients.find((c) => c.id === proposal.client_id);
        setFormData((prev) => ({
          ...prev,
          client_id: proposal.client_id || prev.client_id,
          proposal_id: proposalId,
          title: `Contrato - ${proposal.title}`,
          contract_object: proposal.description || prev.contract_object,
          service_scope: proposal.deliverables || prev.service_scope,
          deadline: proposal.estimated_deadline || prev.deadline,
          value_and_payment: proposal.total_value
            ? `Valor total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total_value)}\n\n${proposal.payment_terms || ''}`
            : prev.value_and_payment,
        }));
      }
    }
  }, [searchParams, proposals, clients]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!workspace?.id || !formData.client_id) {
        throw new Error('Cliente é obrigatório');
      }

      const payload = {
        workspace_id: workspace.id,
        client_id: formData.client_id,
        proposal_id: formData.proposal_id || null,
        title: formData.title,
        parties_identification: formData.parties_identification || null,
        contract_object: formData.contract_object || null,
        service_scope: formData.service_scope || null,
        deadline: formData.deadline || null,
        value_and_payment: formData.value_and_payment || null,
        responsibilities: formData.responsibilities || null,
        cancellation_terms: formData.cancellation_terms || null,
        jurisdiction: formData.jurisdiction || null,
        status: formData.status,
        created_by_user_id: user?.id || null,
      };

      if (isEditing && id) {
        const { error } = await supabase.from('contracts').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('contracts').insert(payload);
        if (error) throw error;

        // Log activity
        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          type: 'CONTRACT_CREATED',
          message: `Contrato "${formData.title}" criado`,
          metadata: {
            client_id: formData.client_id,
            proposal_id: formData.proposal_id,
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(isEditing ? 'Contrato atualizado' : 'Contrato criado');
      navigate('/vendas/contratos');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar contrato');
    },
  });

  const handleCopyText = () => {
    const client = clients.find((c) => c.id === formData.client_id);
    const text = `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

${formData.title}

1. DAS PARTES
${formData.parties_identification}

2. DO OBJETO
${formData.contract_object}

3. DO ESCOPO DOS SERVIÇOS
${formData.service_scope}

4. DO PRAZO
${formData.deadline || '[Prazo a definir]'}

5. DO VALOR E PAGAMENTO
${formData.value_and_payment || '[Valores a definir]'}

6. DAS RESPONSABILIDADES
${formData.responsibilities}

7. DO CANCELAMENTO
${formData.cancellation_terms}

8. DO FORO
${formData.jurisdiction}

E, por estarem assim justos e contratados, firmam o presente instrumento.

[Local], [Data]

_____________________________
CONTRATANTE

_____________________________
CONTRATADA
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Contrato copiado');

    // Log activity
    if (workspace?.id) {
      supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'CONTRACT_EXPORTED',
        message: `Contrato "${formData.title}" copiado`,
      });
    }
  };

  if (loadingContract) {
    return (
      <AppLayout title="Contrato">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isEditing ? 'Editar Contrato' : 'Novo Contrato'}>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vendas/contratos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
            </h2>
            <p className="text-muted-foreground">
              Todos os campos são editáveis. Personalize conforme necessário.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações do Contrato</CardTitle>
            <CardDescription>
              Texto claro e simples, sem termos jurídicos complexos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
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

            {/* Proposal Selection */}
            {proposals && proposals.length > 0 && (
              <div className="space-y-2">
                <Label>Proposta (opcional)</Label>
                <Select
                  value={formData.proposal_id || ''}
                  onValueChange={(value) => {
                    const proposal = proposals.find((p) => p.id === value);
                    if (proposal) {
                      setFormData({
                        ...formData,
                        proposal_id: value,
                        client_id: proposal.client_id || formData.client_id,
                        title: `Contrato - ${proposal.title}`,
                        contract_object: proposal.description || formData.contract_object,
                        service_scope: proposal.deliverables || formData.service_scope,
                        deadline: proposal.estimated_deadline || formData.deadline,
                        value_and_payment: proposal.total_value
                          ? `Valor total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total_value)}\n\n${proposal.payment_terms || ''}`
                          : formData.value_and_payment,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma proposta para preencher automaticamente" />
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

            {/* Title */}
            <div className="space-y-2">
              <Label>Título do Contrato *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Contrato de desenvolvimento de site"
              />
            </div>

            {/* Parties */}
            <div className="space-y-2">
              <Label>Identificação das Partes</Label>
              <Textarea
                value={formData.parties_identification}
                onChange={(e) => setFormData({ ...formData, parties_identification: e.target.value })}
                rows={6}
              />
            </div>

            {/* Object */}
            <div className="space-y-2">
              <Label>Objeto do Contrato</Label>
              <Textarea
                value={formData.contract_object}
                onChange={(e) => setFormData({ ...formData, contract_object: e.target.value })}
                rows={3}
              />
            </div>

            {/* Scope */}
            <div className="space-y-2">
              <Label>Escopo do Serviço</Label>
              <Textarea
                value={formData.service_scope}
                onChange={(e) => setFormData({ ...formData, service_scope: e.target.value })}
                rows={5}
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                placeholder="Ex: 30 dias úteis a partir da assinatura"
              />
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label>Valor e Pagamento</Label>
              <Textarea
                value={formData.value_and_payment}
                onChange={(e) => setFormData({ ...formData, value_and_payment: e.target.value })}
                placeholder="Ex: Valor total de R$ 5.000,00, a ser pago em duas parcelas..."
                rows={4}
              />
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
              <Label>Responsabilidades</Label>
              <Textarea
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                rows={8}
              />
            </div>

            {/* Cancellation */}
            <div className="space-y-2">
              <Label>Cancelamento</Label>
              <Textarea
                value={formData.cancellation_terms}
                onChange={(e) => setFormData({ ...formData, cancellation_terms: e.target.value })}
                rows={4}
              />
            </div>

            {/* Jurisdiction */}
            <div className="space-y-2">
              <Label>Foro</Label>
              <Input
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
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
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="signed">Assinado</SelectItem>
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
            {isEditing ? 'Salvar Alterações' : 'Criar Contrato'}
          </Button>
          <Button variant="outline" onClick={handleCopyText} className="gap-2">
            <Copy className="h-4 w-4" />
            Copiar Contrato
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
