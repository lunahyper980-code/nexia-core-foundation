import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import logoNexia from '@/assets/logo-nexia.png';
import { z } from 'zod';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      navigate('/solucoes', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      toast.success(state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(formData);
    
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
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('E-mail ou senha incorretos');
        } else {
          toast.error('Erro ao fazer login. Tente novamente.');
        }
        return;
      }

      toast.success('Bem-vindo de volta!');
      navigate('/solucoes', { replace: true });
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[hsl(228,12%,5%)] relative overflow-hidden">
      {/* Background gradient subtle */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/[0.08] to-transparent blur-3xl opacity-50 pointer-events-none" />
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Main Card Container */}
      <div className="relative w-full max-w-[1000px] bg-card/80 backdrop-blur-xl rounded-2xl border border-border/40 shadow-2xl shadow-primary/5 overflow-hidden animate-fade-in">
        {/* Glow effect on card */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="flex flex-col lg:flex-row min-h-[560px]">
          {/* Left Column - Branding (hidden on mobile, shown at top on tablet) */}
          <div className="relative lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-gradient-to-br from-background/50 to-transparent border-b lg:border-b-0 lg:border-r border-border/30">
            {/* Decorative flare/energy effect */}
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none overflow-hidden">
              <div className="absolute bottom-[-100px] left-[-100px] w-[350px] h-[350px]">
                {/* Purple/blue energy wave */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-purple-500/20 to-blue-500/10 rounded-full blur-3xl opacity-60" />
                <div className="absolute inset-8 bg-gradient-to-tr from-primary/30 via-purple-600/20 to-transparent rounded-full blur-2xl opacity-80" />
                <div className="absolute inset-16 bg-gradient-to-tr from-primary/50 to-transparent rounded-full blur-xl opacity-40" />
              </div>
            </div>

            {/* Top content */}
            <div className="relative z-10">
              {/* Version label */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary/80 uppercase tracking-wider mb-6 sm:mb-8">
                <Sparkles className="w-3 h-3" />
                Nexia Suite
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                Centralize sua{' '}
                <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
                  operação digital.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[380px]">
                Gerencie prospecção, planejamento e entregas em um único ambiente inteligente.
              </p>
            </div>

            {/* Bottom decorative element - desktop only */}
            <div className="hidden lg:flex items-center gap-3 relative z-10 mt-auto pt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] font-medium text-primary/70">NS</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Centenas de agências já operam conosco
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="w-full max-w-[360px] mx-auto">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src={logoNexia} alt="Nexia" className="w-14 h-14 object-contain" />
              </div>

              {/* Form header */}
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  Acesse sua conta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo de volta. Digite seus dados para entrar.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Senha
                    </label>
                    <button
                      type="button"
                      className="text-xs text-primary/80 hover:text-primary transition-colors"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all pr-11 placeholder:text-muted-foreground/50 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>

                {/* Submit button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 group" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      ENTRAR
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer links */}
              <div className="mt-6 space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{' '}
                  <Link to="/cadastro" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Criar conta
                  </Link>
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </div>
  );
}
