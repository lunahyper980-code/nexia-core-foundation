import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Palette, Wand2, Check, Sparkles, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectsList } from '@/components/hyperbuild/ProjectsList';
import solutionTemplate from '@/assets/solution-template.png';
import solutionScratch from '@/assets/solution-scratch.png';

export default function CriarAppHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('criar');

  const options = [
    {
      id: 'template',
      title: 'Modelo Pronto',
      desc: 'Comece com templates profissionais prontos para personalizar',
      image: solutionTemplate,
      icon: Palette,
      path: '/solucoes/templates?type=app',
      features: ['+10 templates', 'Personalizável', 'Pronto para usar'],
    },
    {
      id: 'scratch',
      title: 'Criar do Zero',
      desc: 'Máxima liberdade para criar um app totalmente personalizado',
      image: solutionScratch,
      icon: Wand2,
      path: '/solucoes/criar/app/novo',
      features: ['100% customizável', 'IA assistida', 'Sem limites'],
    },
  ];

  return (
    <AppLayout title="Criar App / SaaS">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Criar App / SaaS</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                Solução Digital
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Escolha como deseja começar seu aplicativo
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="criar" className="flex-1 sm:flex-none gap-2">
              <Wand2 className="h-4 w-4" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="projetos" className="flex-1 sm:flex-none gap-2">
              <FolderOpen className="h-4 w-4" />
              Projetos Criados
            </TabsTrigger>
          </TabsList>

          {/* Tab: Criar */}
          <TabsContent value="criar" className="space-y-6">
            {/* Options Grid - Premium Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => navigate(option.path)}
                  className="group relative cursor-pointer rounded-2xl overflow-hidden bg-[hsl(228,12%,10%)] border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(268,60%,50%/0.15)] hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={option.image}
                      alt={option.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(228,12%,10%)] via-transparent to-transparent" />
                    
                    {/* Floating Icon Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/20 group-hover:bg-primary/30 transition-colors">
                        <option.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">{option.desc}</p>
                    </div>

                    {/* Features as mini cards */}
                    <div className="flex flex-wrap gap-2">
                      {option.features.map((feature, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <Check className="h-3 w-3 text-primary" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full gap-2 group-hover:shadow-[0_0_20px_hsl(268,60%,50%/0.3)] transition-shadow">
                      Começar
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                  </div>
                </div>
              ))}
            </div>

            {/* Info Card */}
            <div className="flex items-start gap-4 p-5 rounded-xl bg-[hsl(228,12%,10%)] border border-border/50">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Dica</h4>
                <p className="text-sm text-muted-foreground">
                  Modelos prontos aceleram seu desenvolvimento com estruturas otimizadas. 
                  Criar do zero oferece controle total para projetos únicos.
                </p>
              </div>
            </div>

            {/* Link to Projects */}
            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setActiveTab('projetos')}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Ver projetos criados
              </Button>
            </div>
          </TabsContent>

          {/* Tab: Projetos Criados */}
          <TabsContent value="projetos">
            <ProjectsList 
              projectType="app" 
              onNewProject={() => setActiveTab('criar')} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
