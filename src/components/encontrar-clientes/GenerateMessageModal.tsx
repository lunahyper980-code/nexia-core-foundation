import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, MessageCircle, RefreshCw, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from './LeadCard';

interface GenerateMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

export function GenerateMessageModal({ open, onOpenChange, lead }: GenerateMessageModalProps) {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const generateMessage = async () => {
    if (!lead) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lead-message', {
        body: { lead }
      });

      if (error) throw error;
      setMessage(data.message);
      if (data.language) {
        setDetectedLanguage(data.language);
      }
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Erro ao gerar mensagem');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (open && lead) {
      setDetectedLanguage(null);
      generateMessage();
    }
  }, [open, lead]);

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Mensagem copiada!');
  };

  const openWhatsApp = () => {
    if (lead?.telefone) {
      const phone = lead.telefone.replace(/\D/g, '');
      const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      copyMessage();
      toast.info('Telefone não disponível. Mensagem copiada para usar manualmente.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Mensagem para {lead?.nome}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Mensagem profissional pronta para WhatsApp
            {detectedLanguage && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Globe className="h-3 w-3" />
                {detectedLanguage}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isGenerating ? (
            <div className="h-40 flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Gerando mensagem...</span>
              </div>
            </div>
          ) : (
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[180px] resize-none"
              placeholder="Mensagem será gerada aqui..."
            />
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={generateMessage}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerar
            </Button>
            
            <Button
              variant="outline"
              className="gap-2"
              onClick={copyMessage}
              disabled={!message}
            >
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            
            <Button
              className="flex-1 gap-2"
              onClick={openWhatsApp}
              disabled={!message}
            >
              <MessageCircle className="h-4 w-4" />
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
