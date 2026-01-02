import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import logoNexia from '@/assets/logo-nexia.png';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user came from a valid recovery link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // User should have a session from the recovery link
      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('same')) {
          toast.error('A nova senha deve ser diferente da anterior');
        } else {
          toast.error('Erro ao atualizar senha. Tente novamente.');
        }
        return;
      }

      setSuccess(true);
      
      // Sign out after password change
      await supabase.auth.signOut();
      
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { 
      replace: true, 
      state: { message: 'Senha atualizada com sucesso! Faça login com sua nova senha.' } 
    });
  };

  if (isValidSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isValidSession === false) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
              <img src={logoNexia} alt="Nexia Suite" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-bold text-foreground">NEXIA SUITE</span>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Link inválido ou expirado</h2>
              <p className="text-muted-foreground mb-6">
                O link de recuperação de senha é inválido ou já expirou. 
                Solicite um novo link na página de login.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Voltar para login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
              <img src={logoNexia} alt="Nexia Suite" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-bold text-foreground">NEXIA SUITE</span>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Senha atualizada!</h2>
              <p className="text-muted-foreground mb-6">
                Sua senha foi atualizada com sucesso. 
                Agora você pode fazer login com sua nova senha.
              </p>
              <Button onClick={handleGoToLogin} className="w-full">
                Ir para login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-card border-r border-border">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={logoNexia} alt="Nexia Suite" className="w-14 h-14 object-contain" />
            <span className="text-3xl font-bold text-foreground">NEXIA SUITE</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Redefinir senha
          </h1>
          <p className="text-lg text-muted-foreground">
            Crie uma nova senha segura para sua conta.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <img src={logoNexia} alt="Nexia Suite" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-foreground">NEXIA SUITE</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Nova senha</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Digite sua nova senha abaixo
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Digite novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar senha'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
