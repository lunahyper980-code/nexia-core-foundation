import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { useUserMode } from '@/contexts/UserModeContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ModeSelectionModalProps {
  open: boolean;
}

export function ModeSelectionModal({ open }: ModeSelectionModalProps) {
  const { setMode } = useUserMode();
  const [selectedMode, setSelectedMode] = useState<'simple' | 'advanced' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedMode) return;

    setIsSubmitting(true);
    try {
      await setMode(selectedMode);
      toast.success('Modo selecionado com sucesso!', {
        description: selectedMode === 'simple' 
          ? 'Você está no Modo Simples.' 
          : 'Você está no Modo Avançado.',
      });
    } catch (error) {
      toast.error('Erro ao salvar preferência');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modes = [
    {
      id: 'simple' as const,
      title: 'Modo Simples',
      subtitle: 'Criar e Vender Apps & Sites',
      description: 'Interface mais simples, foco em criar, vender e entregar apps e sites.',
      icon: Smartphone,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      selectedBg: 'bg-primary/5',
    },
    {
      id: 'advanced' as const,
      title: 'Modo Avançado',
      subtitle: 'Agência',
      description: 'Planejamento, diagnóstico, pipeline e gestão completa.',
      icon: Building2,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
      selectedBg: 'bg-violet-500/5',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">
            Como você quer usar o Nexia?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Escolha o modo que melhor se adapta ao seu fluxo de trabalho
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;

            return (
              <Card
                key={mode.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 border-2',
                  isSelected 
                    ? `${mode.borderColor} ${mode.selectedBg}` 
                    : 'border-foreground/10 hover:border-foreground/20'
                )}
                onClick={() => setSelectedMode(mode.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-xl', mode.bgColor)}>
                      <Icon className={cn('h-6 w-6', mode.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {mode.title}
                          </h3>
                          <p className={cn('text-sm font-medium', mode.color)}>
                            {mode.subtitle}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className={cn('h-5 w-5', mode.color)} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Você poderá mudar esse modo a qualquer momento nas configurações.
        </p>

        <Button
          onClick={handleConfirm}
          disabled={!selectedMode || isSubmitting}
          className="w-full mt-4"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Confirmar'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
