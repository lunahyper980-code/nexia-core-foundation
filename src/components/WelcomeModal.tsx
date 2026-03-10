import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'nexia_welcome_shown';

export function WelcomeModal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const shown = localStorage.getItem(STORAGE_KEY);
    if (!shown) {
      setOpen(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [user]);

  const handleStart = () => {
    setOpen(false);
    navigate('/solucoes');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Bem-vindo ao Nexia
          </DialogTitle>
          <DialogDescription>
            A maioria dos usuários cria seu primeiro projeto em poucos minutos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground/80">
            Você pode começar de duas formas:
          </p>
          <ul className="text-sm text-foreground/80 space-y-1 pl-1">
            <li>✅ Usando um template pronto</li>
            <li>✅ Criando um projeto do zero</li>
          </ul>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Passos recomendados:</p>
            <ol className="text-sm text-foreground/80 space-y-1 pl-1">
              <li>1️⃣ Escolha um template ou inicie um projeto</li>
              <li>2️⃣ Gere seu primeiro aplicativo ou site</li>
              <li>3️⃣ Personalize para seu cliente</li>
            </ol>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-accent/10 border border-accent/20 p-3">
            <AlertTriangle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              A garantia de 7 dias é válida para quem testar a plataforma e tentar criar seu primeiro projeto.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleStart} className="w-full">
            Criar meu primeiro projeto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
