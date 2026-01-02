import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Copy, Check, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const messageTypes = [
  { value: 'primeiro_contato', label: 'Primeiro Contato', icon: '👋' },
  { value: 'envio_proposta', label: 'Envio de Proposta', icon: '📄' },
  { value: 'followup', label: 'Follow-up', icon: '🔄' },
  { value: 'fechamento', label: 'Fechamento', icon: '🤝' },
  { value: 'pos_venda', label: 'Pós-venda', icon: '⭐' },
  { value: 'entrega', label: 'Entrega de Projeto', icon: '🎉' },
];

const messageTemplates: Record<string, string> = {
  primeiro_contato: `Olá, {nome}! 👋

Tudo bem? Aqui é [seu nome], da [sua empresa].

Estou entrando em contato porque acredito que posso ajudar o(a) {empresa} a {objetivo}.

Podemos conversar sobre isso? Tenho algumas ideias que podem fazer sentido para você.

Fico no aguardo!`,

  envio_proposta: `Olá, {nome}! 📄

Conforme conversamos, estou enviando a proposta para {servico}.

Valor: {valor}
Prazo: {prazo}

Qualquer dúvida, estou à disposição para esclarecer.

O que acha? Posso te ligar para explicar melhor?`,

  followup: `Olá, {nome}! 🔄

Passando para saber se você teve a oportunidade de analisar a proposta que enviei.

Posso ajudar com alguma dúvida ou ajustar algum ponto?

Fico no aguardo do seu retorno!`,

  fechamento: `Olá, {nome}! 🤝

Que ótima notícia! Fico muito feliz em trabalhar com você.

Vou preparar o contrato e te envio ainda hoje para formalizarmos.

Assim que você confirmar, já começamos a trabalhar no seu projeto!

Obrigado pela confiança!`,

  pos_venda: `Olá, {nome}! ⭐

Passando para saber como está tudo por aí.

O projeto está funcionando bem? Tem alguma dúvida ou algo que eu possa ajudar?

Fico à disposição sempre que precisar!`,

  entrega: `Olá, {nome}! 🎉

É com muita satisfação que informo que o projeto está concluído!

{servico} está pronto e disponível para você.

Qualquer ajuste ou dúvida, é só me chamar.

Foi um prazer trabalhar neste projeto. Obrigado pela parceria!`,
};

export default function MensagensWhatsApp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { clients } = useClients();
  
  const [selectedClient, setSelectedClient] = useState(searchParams.get('clientId') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'primeiro_contato');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch proposal if provided
  const proposalId = searchParams.get('proposalId');
  const { data: proposal } = useQuery({
    queryKey: ['proposal-message', proposalId],
    queryFn: async () => {
      if (!proposalId) return null;
      const { data, error } = await supabase
        .from('proposals')
        .select('*, clients(name)')
        .eq('id', proposalId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });

  // Set client from proposal
  useEffect(() => {
    if (proposal?.client_id) {
      setSelectedClient(proposal.client_id);
      setSelectedType('envio_proposta');
    }
  }, [proposal]);

  // Update message when selections change
  useEffect(() => {
    const client = clients.find((c) => c.id === selectedClient);
    let template = messageTemplates[selectedType] || '';

    // Replace placeholders
    template = template.replace(/{nome}/g, client?.contact_name || client?.name || '[Nome]');
    template = template.replace(/{empresa}/g, client?.name || '[Empresa]');
    template = template.replace(/{objetivo}/g, '[objetivo do cliente]');
    
    if (proposal) {
      template = template.replace(/{servico}/g, proposal.title || proposal.service_type || '[serviço]');
      template = template.replace(/{valor}/g, proposal.total_value 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total_value)
        : '[valor]'
      );
      template = template.replace(/{prazo}/g, proposal.estimated_deadline || '[prazo]');
    } else {
      template = template.replace(/{servico}/g, '[serviço]');
      template = template.replace(/{valor}/g, '[valor]');
      template = template.replace(/{prazo}/g, '[prazo]');
    }

    setMessage(template);
  }, [selectedClient, selectedType, clients, proposal]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Mensagem copiada!');

    // Log activity
    if (workspace?.id) {
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'WHATSAPP_MESSAGE_COPIED',
        message: `Mensagem de ${messageTypes.find((t) => t.value === selectedType)?.label} copiada`,
        metadata: {
          client_id: selectedClient || null,
          message_type: selectedType,
        },
      });
    }

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout title="Mensagens WhatsApp">
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vendas')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Mensagens WhatsApp</h2>
            <p className="text-muted-foreground">
              Templates prontos para abordagem comercial. Copie e personalize conforme necessário.
            </p>
          </div>
        </div>

        {/* Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurar Mensagem</CardTitle>
            <CardDescription>
              Selecione o cliente e o tipo de mensagem para gerar automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
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

            {/* Message Type */}
            <div className="space-y-2">
              <Label>Tipo de Mensagem</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {messageTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? 'default' : 'outline'}
                    className="justify-start gap-2 h-auto py-3"
                    onClick={() => setSelectedType(type.value)}
                  >
                    <span>{type.icon}</span>
                    <span className="text-sm">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-success" />
                <CardTitle className="text-base">Mensagem</CardTitle>
              </div>
              <Button onClick={handleCopy} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Edite o texto abaixo se precisar personalizar algo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-secondary/50">
          <CardContent className="pt-6">
            <h4 className="font-medium text-foreground mb-2">Dicas</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Personalize a mensagem com informações específicas do cliente</li>
              <li>• Substitua os textos entre [colchetes] por dados reais</li>
              <li>• Mantenha um tom profissional e amigável</li>
              <li>• Seja objetivo e claro na comunicação</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
