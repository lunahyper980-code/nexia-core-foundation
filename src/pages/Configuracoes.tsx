import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Shield, Save, Loader2, Settings2, Cog, MonitorPlay, Users } from 'lucide-react';
import { NexiaLoader } from '@/components/ui/nexia-loader';

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
}

export default function Configuracoes() {
  const { user } = useAuth();
  const { isAdminOrOwner, isAdmin, loading: roleLoading } = useUserRole();
  const { isDemoMode, setDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
        setFormData({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
        });
      }

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subData) {
        setSubscription(subData as Subscription);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: formData.full_name })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDemoModeToggle = (checked: boolean) => {
    setDemoMode(checked);
    if (checked) {
      toast.success('Modo Demonstração ativado', {
        description: 'Comportamento especial para apresentações está ativo.'
      });
    } else {
      toast.info('Modo Demonstração desativado', {
        description: 'Sistema voltou ao comportamento normal.'
      });
    }
  };

  if (loading || roleLoading) {
    return (
      <AppLayout title="Configurações">
        <div className="flex items-center justify-center py-12">
          <NexiaLoader size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Configurações">
      <div className="w-full space-y-6 max-w-3xl">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Perfil</CardTitle>
                <CardDescription>Suas informações pessoais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Segurança</CardTitle>
                <CardDescription>Configurações de senha e segurança</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alterar senha</p>
                <p className="text-sm text-muted-foreground">
                  Atualize sua senha de acesso
                </p>
              </div>
              <Button variant="outline" onClick={() => toast.info('Recurso em breve!')}>
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Admin Section - Only visible to admins/owners */}
        {isAdminOrOwner && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Área Administrativa</CardTitle>
                  <CardDescription>Gestão de usuários e configurações avançadas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/admin/usuarios')} 
                  variant="outline"
                  className="gap-2 justify-start h-auto py-4"
                >
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Gerenciar Usuários</p>
                    <p className="text-xs text-muted-foreground">Controle de acesso e permissões</p>
                  </div>
                </Button>
                <Button 
                  onClick={() => navigate('/admin')} 
                  variant="outline"
                  className="gap-2 justify-start h-auto py-4"
                >
                  <Settings2 className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Painel Admin</p>
                    <p className="text-xs text-muted-foreground">Créditos e configurações</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Controls - Only visible to ADMIN (not owner) */}
        {isAdmin && (
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Cog className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Controles Avançados</CardTitle>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10 text-[10px]">
                      ADMIN
                    </Badge>
                  </div>
                  <CardDescription>Configurações exclusivas para administradores</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Demo Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-foreground/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MonitorPlay className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Modo Demonstração (Admin)</p>
                    <p className="text-sm text-muted-foreground">
                      Ativa comportamento especial para apresentações e demonstrações. Não afeta usuários finais.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDemoMode}
                  onCheckedChange={handleDemoModeToggle}
                />
              </div>

              {isDemoMode && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <MonitorPlay className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-600">
                    O modo demonstração está ativo. Validações simplificadas e fluxos especiais estão habilitados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
