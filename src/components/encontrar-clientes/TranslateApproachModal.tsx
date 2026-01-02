import { useState } from 'react';
import { Languages, Copy, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const LANGUAGES = [
  { code: 'en', label: 'Inglês (English)' },
  { code: 'es', label: 'Espanhol (Español)' },
  { code: 'fr', label: 'Francês (Français)' },
  { code: 'de', label: 'Alemão (Deutsch)' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'it', label: 'Italiano (Italiano)' },
  { code: 'nl', label: 'Holandês (Nederlands)' },
  { code: 'zh', label: 'Chinês (中文)' },
  { code: 'ja', label: 'Japonês (日本語)' },
  { code: 'ko', label: 'Coreano (한국어)' },
  { code: 'other', label: 'Outro idioma...' },
];

interface TranslateApproachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalMessage: string;
  messageType?: string;
}

export function TranslateApproachModal({ 
  open, 
  onOpenChange, 
  originalMessage,
  messageType = 'mensagem'
}: TranslateApproachModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [customLanguage, setCustomLanguage] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState<'translated' | 'original'>('translated');

  const handleTranslate = async () => {
    if (!originalMessage.trim()) {
      toast.error('Nenhuma mensagem para traduzir');
      return;
    }

    if (selectedLanguage === 'other' && !customLanguage.trim()) {
      toast.error('Digite o idioma desejado');
      return;
    }

    setIsTranslating(true);
    
    try {
      const isCustom = selectedLanguage === 'other';
      const languageLabel = isCustom 
        ? customLanguage.trim() 
        : LANGUAGES.find(l => l.code === selectedLanguage)?.label || selectedLanguage;
      const languageCode = isCustom ? customLanguage.trim() : selectedLanguage;
      
      const { data, error } = await supabase.functions.invoke('translate-approach', {
        body: {
          message: originalMessage,
          targetLanguage: languageCode,
          targetLanguageLabel: languageLabel,
        }
      });

      if (error) {
        console.error('Translation error:', error);
        throw error;
      }

      if (data?.translatedMessage) {
        setTranslatedMessage(data.translatedMessage);
        setActiveTab('translated');
        toast.success('Mensagem traduzida!');
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Error translating:', error);
      toast.error('Erro ao traduzir. Tente novamente.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const handleClose = () => {
    setTranslatedMessage('');
    setActiveTab('translated');
    setCustomLanguage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            Traduzir Abordagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Idioma de destino
            </label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedLanguage === 'other' && (
              <Input
                placeholder="Digite o idioma (ex: Polonês, Tailandês, Hindi...)"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Translate Button */}
          <Button 
            onClick={handleTranslate} 
            disabled={isTranslating}
            className="w-full gap-2"
          >
            {isTranslating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Traduzindo...
              </>
            ) : (
              <>
                <Languages className="h-4 w-4" />
                Traduzir mensagem
              </>
            )}
          </Button>

          {/* Message Tabs */}
          {(translatedMessage || originalMessage) && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'translated' | 'original')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="translated" disabled={!translatedMessage}>
                  Traduzida
                </TabsTrigger>
                <TabsTrigger value="original">
                  Original
                </TabsTrigger>
              </TabsList>

              <TabsContent value="translated" className="mt-3">
                {translatedMessage ? (
                  <div className="space-y-3">
                    <div className="bg-card border border-border/50 rounded-xl p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {translatedMessage}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 flex-1"
                        onClick={() => copyToClipboard(translatedMessage)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="gap-2"
                        onClick={handleTranslate}
                        disabled={isTranslating}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retraduzir
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Selecione um idioma e clique em "Traduzir mensagem"
                  </div>
                )}
              </TabsContent>

              <TabsContent value="original" className="mt-3">
                <div className="space-y-3">
                  <div className="bg-muted/30 border border-border/30 rounded-xl p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {originalMessage}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 w-full"
                    onClick={() => copyToClipboard(originalMessage)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar original
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Info */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Nota:</span> A tradução preserva o tom comercial e consultivo da mensagem original, mantendo o objetivo da abordagem.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
