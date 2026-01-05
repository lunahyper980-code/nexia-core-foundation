import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Copy, 
  MessageSquare, 
  FileText, 
  Edit3, 
  CheckCircle2,
  Send,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Lead } from './LeadCard';

interface SendBriefingModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const BRIEFING_QUESTIONS = `📋 BRIEFING PROFISSIONAL

Por favor, responda às perguntas abaixo para que possamos entender melhor o seu negócio:

🏢 SOBRE O NEGÓCIO
1. Qual o nome da sua empresa?
2. Em qual cidade/região você atua?
3. Qual é o segmento do seu negócio?
4. Há quanto tempo a empresa existe?
5. Qual o tamanho da empresa? (MEI, Micro, Pequena, Média, Grande)

🌐 PRESENÇA DIGITAL
6. Você possui site? (Sim/Não)
7. Quais redes sociais você utiliza? (Instagram, Facebook, WhatsApp Business, LinkedIn, TikTok, YouTube)
8. Qual o principal canal de contato com seus clientes?
9. Como é feito o atendimento? (Manual, Semi-automatizado, Automatizado)

⚠️ SITUAÇÃO ATUAL
10. Qual a principal dificuldade do seu negócio hoje?
11. Em qual momento você sente que perde mais clientes?
12. Qual o maior gargalo na sua operação?

🎯 OBJETIVOS
13. O que você mais gostaria de melhorar no seu negócio?
14. Qual a sua maior prioridade agora?
15. Quais dessas soluções te interessam?
   [ ] Site profissional
   [ ] Aplicativo
   [ ] Autoridade digital
   [ ] Organização de processos
   [ ] Posicionamento de marca
   [ ] Kit de lançamento

Aguardamos suas respostas! 🚀`;

export function SendBriefingModal({ open, onClose, lead }: SendBriefingModalProps) {
  const navigate = useNavigate();
  const [copiedOption, setCopiedOption] = useState<string | null>(null);

  if (!open) return null;

  const copyToClipboard = (text: string, optionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOption(optionId);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedOption(null), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(BRIEFING_QUESTIONS);
    const phone = lead?.telefone?.replace(/\D/g, '') || '';
    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  const handleGeneratePDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Briefing Profissional${lead ? ` - ${lead.nome}` : ''}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #059669;
              border-bottom: 2px solid #059669;
              padding-bottom: 10px;
            }
            h2 {
              color: #065f46;
              margin-top: 30px;
              font-size: 18px;
            }
            .question {
              margin: 12px 0;
              padding: 10px;
              background: #f9fafb;
              border-radius: 6px;
            }
            .answer-line {
              border-bottom: 1px solid #d1d5db;
              margin-top: 8px;
              min-height: 30px;
            }
            .checkbox-group {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 10px;
            }
            .checkbox-item {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .checkbox {
              width: 18px;
              height: 18px;
              border: 2px solid #d1d5db;
              border-radius: 4px;
            }
            .header-info {
              background: #ecfdf5;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>📋 Briefing Profissional</h1>
          ${lead ? `
          <div class="header-info">
            <strong>Empresa:</strong> ${lead.nome}<br>
            <strong>Segmento:</strong> ${lead.segmento || 'Não informado'}<br>
            <strong>Localização:</strong> ${lead.localizacao || 'Não informado'}
          </div>
          ` : ''}
          
          <h2>🏢 SOBRE O NEGÓCIO</h2>
          <div class="question">1. Qual o nome da sua empresa?<div class="answer-line"></div></div>
          <div class="question">2. Em qual cidade/região você atua?<div class="answer-line"></div></div>
          <div class="question">3. Qual é o segmento do seu negócio?<div class="answer-line"></div></div>
          <div class="question">4. Há quanto tempo a empresa existe?<div class="answer-line"></div></div>
          <div class="question">5. Qual o tamanho da empresa?<div class="answer-line"></div></div>

          <h2>🌐 PRESENÇA DIGITAL</h2>
          <div class="question">6. Você possui site?<div class="answer-line"></div></div>
          <div class="question">7. Quais redes sociais você utiliza?<div class="answer-line"></div></div>
          <div class="question">8. Qual o principal canal de contato com seus clientes?<div class="answer-line"></div></div>
          <div class="question">9. Como é feito o atendimento?<div class="answer-line"></div></div>

          <h2>⚠️ SITUAÇÃO ATUAL</h2>
          <div class="question">10. Qual a principal dificuldade do seu negócio hoje?<div class="answer-line"></div><div class="answer-line"></div></div>
          <div class="question">11. Em qual momento você sente que perde mais clientes?<div class="answer-line"></div><div class="answer-line"></div></div>
          <div class="question">12. Qual o maior gargalo na sua operação?<div class="answer-line"></div><div class="answer-line"></div></div>

          <h2>🎯 OBJETIVOS</h2>
          <div class="question">13. O que você mais gostaria de melhorar no seu negócio?<div class="answer-line"></div><div class="answer-line"></div></div>
          <div class="question">14. Qual a sua maior prioridade agora?<div class="answer-line"></div></div>
          <div class="question">
            15. Quais dessas soluções te interessam?
            <div class="checkbox-group">
              <div class="checkbox-item"><div class="checkbox"></div> Site profissional</div>
              <div class="checkbox-item"><div class="checkbox"></div> Aplicativo</div>
              <div class="checkbox-item"><div class="checkbox"></div> Autoridade digital</div>
              <div class="checkbox-item"><div class="checkbox"></div> Organização de processos</div>
              <div class="checkbox-item"><div class="checkbox"></div> Posicionamento de marca</div>
              <div class="checkbox-item"><div class="checkbox"></div> Kit de lançamento</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('Gerando PDF para impressão...');
  };

  const handleFillInNexia = () => {
    const params = new URLSearchParams({
      leadName: lead?.nome || '',
      leadSegment: lead?.segmento || '',
      leadLocation: lead?.localizacao || '',
    });
    navigate(`/nexia-ai/briefing/novo?${params.toString()}`);
    onClose();
  };

  const options = [
    {
      id: 'copy',
      title: 'Copiar perguntas',
      description: 'Copie as perguntas para enviar por qualquer canal',
      icon: Copy,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      action: () => copyToClipboard(BRIEFING_QUESTIONS, 'copy'),
    },
    {
      id: 'whatsapp',
      title: 'Enviar via WhatsApp',
      description: 'Abre o WhatsApp com as perguntas prontas',
      icon: MessageSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      action: handleWhatsApp,
    },
    {
      id: 'pdf',
      title: 'Gerar PDF de perguntas',
      description: 'Gere um PDF profissional para o cliente preencher',
      icon: FileText,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      action: handleGeneratePDF,
    },
    {
      id: 'nexia',
      title: 'Preencher no Nexia',
      description: 'Preencha você mesmo as respostas do cliente',
      icon: Edit3,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      action: handleFillInNexia,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <ClipboardList className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Enviar Briefing</h2>
              <p className="text-xs text-muted-foreground">
                {lead?.nome || 'Cliente'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Escolha como deseja coletar as informações do cliente
          </p>

          {options.map((option) => {
            const Icon = option.icon;
            const isCopied = copiedOption === option.id;
            
            return (
              <button
                key={option.id}
                onClick={option.action}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className={`p-2.5 rounded-xl ${option.bgColor}`}>
                  {isCopied ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Icon className={`h-5 w-5 ${option.color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    {isCopied ? 'Copiado!' : option.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </p>
                </div>
                <Send className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            💡 Após coletar as respostas, preencha no Nexia para gerar o diagnóstico inteligente.
          </p>
        </div>
      </div>
    </div>
  );
}
