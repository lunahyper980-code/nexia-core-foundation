import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, Smartphone, Globe, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

// Import solution type images
import solutionTypeApp from '@/assets/solution-type-app.png';
import solutionTypeSite from '@/assets/solution-type-site.png';

// Import template images
import templatePizzaria from '@/assets/template-pizzaria.png';
import templateHamburgueria from '@/assets/template-hamburgueria.png';
import templateCafeteria from '@/assets/template-cafeteria.png';
import templateBarbearia from '@/assets/template-barbearia.png';
import templateNailDesigner from '@/assets/template-nail-designer.png';
import templateLojaRoupas from '@/assets/template-loja-roupas.png';
import templateAcademia from '@/assets/template-academia.png';
import templateMecanica from '@/assets/template-mecanica.png';
import templatePetShop from '@/assets/template-pet-shop.png';
import templateDelivery from '@/assets/template-delivery.png';
import templateAgendamento from '@/assets/template-agendamento.png';
import templateLandingPage from '@/assets/template-landing-page.png';
import templatePaginaVendas from '@/assets/template-pagina-vendas.png';
import templateSiteInstitucional from '@/assets/template-site-institucional.png';
import templatePaginaMentoria from '@/assets/template-pagina-mentoria.png';
import templatePaginaLancamento from '@/assets/template-pagina-lancamento.png';
import templatePaginaCaptura from '@/assets/template-pagina-captura.png';
import templateEcommerceSimples from '@/assets/template-ecommerce-simples.png';
import templateNegocioLocal from '@/assets/template-negocio-local.png';
import templatePortfolio from '@/assets/template-portfolio.png';
// New template images
import templateClinicaConsultorio from '@/assets/template-clinica-consultorio.png';
import templateStudioEstetica from '@/assets/template-studio-estetica.png';
import templateCorretorImobiliaria from '@/assets/template-corretor-imobiliaria.png';
import templateLojaCosmeticos from '@/assets/template-loja-cosmeticos.png';
import templateEscolaCurso from '@/assets/template-escola-curso.png';

type SolutionType = 'app' | 'site' | null;

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'app' | 'site' | 'both';
}

const templates: Template[] = [
  // App/SaaS Templates
  {
    id: 'pizzaria',
    name: 'Pizzaria',
    description: 'Cardápio digital e pedidos online para pizzarias',
    image: templatePizzaria,
    type: 'app',
  },
  {
    id: 'hamburgueria',
    name: 'Hamburgueria',
    description: 'Menu interativo e delivery para hamburguerias',
    image: templateHamburgueria,
    type: 'app',
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    description: 'Vitrine digital e fidelidade para cafeterias',
    image: templateCafeteria,
    type: 'app',
  },
  {
    id: 'barbearia',
    name: 'Barbearia',
    description: 'Agendamento online e portfólio para barbearias',
    image: templateBarbearia,
    type: 'app',
  },
  {
    id: 'nail-designer',
    name: 'Nail Designer',
    description: 'Catálogo de trabalhos e agendamento para nail designers',
    image: templateNailDesigner,
    type: 'app',
  },
  {
    id: 'loja-roupas',
    name: 'Loja de Roupas',
    description: 'Vitrine virtual e catálogo para lojas de moda',
    image: templateLojaRoupas,
    type: 'both',
  },
  {
    id: 'academia',
    name: 'Academia',
    description: 'Planos, treinos e agendamento para academias',
    image: templateAcademia,
    type: 'app',
  },
  {
    id: 'mecanica',
    name: 'Mecânica',
    description: 'Orçamentos e agendamento para oficinas mecânicas',
    image: templateMecanica,
    type: 'app',
  },
  {
    id: 'pet-shop',
    name: 'Pet Shop',
    description: 'Serviços, produtos e agendamento para pet shops',
    image: templatePetShop,
    type: 'app',
  },
  {
    id: 'delivery',
    name: 'Delivery',
    description: 'Sistema completo de entregas e rastreamento de pedidos',
    image: templateDelivery,
    type: 'app',
  },
  {
    id: 'agendamento',
    name: 'Agendamento',
    description: 'Sistema de reservas e gestão de horários',
    image: templateAgendamento,
    type: 'app',
  },
  // New App Templates
  {
    id: 'clinica-consultorio',
    name: 'Clínica & Consultório',
    description: 'Agendamento e gestão profissional para clínicas e consultórios',
    image: templateClinicaConsultorio,
    type: 'app',
  },
  {
    id: 'studio-estetica',
    name: 'Studio de Estética & Spa',
    description: 'Agenda, catálogo e fidelidade para studios de estética',
    image: templateStudioEstetica,
    type: 'app',
  },
  {
    id: 'corretor-imobiliaria',
    name: 'Imobiliária & Corretor',
    description: 'Portfólio de imóveis e agendamento de visitas',
    image: templateCorretorImobiliaria,
    type: 'app',
  },
  {
    id: 'loja-cosmeticos',
    name: 'Loja de Cosméticos & Perfumaria',
    description: 'Vitrine digital para lojas de cosméticos e perfumaria',
    image: templateLojaCosmeticos,
    type: 'app',
  },
  {
    id: 'escola-curso-local',
    name: 'Escola & Curso Local',
    description: 'Gestão de alunos, aulas e comunicação para escolas locais',
    image: templateEscolaCurso,
    type: 'app',
  },
  // Site Templates
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Página de conversão para produtos digitais',
    image: templateLandingPage,
    type: 'site',
  },
  {
    id: 'pagina-vendas',
    name: 'Página de Vendas',
    description: 'Página persuasiva para vender produtos e serviços',
    image: templatePaginaVendas,
    type: 'site',
  },
  {
    id: 'site-institucional',
    name: 'Site Institucional',
    description: 'Apresentação profissional da sua empresa',
    image: templateSiteInstitucional,
    type: 'site',
  },
  {
    id: 'pagina-mentoria',
    name: 'Página de Mentoria',
    description: 'Apresentação de programa de mentoria ou coaching',
    image: templatePaginaMentoria,
    type: 'site',
  },
  {
    id: 'pagina-lancamento',
    name: 'Página de Lançamento',
    description: 'Página para lançamento de produtos ou serviços',
    image: templatePaginaLancamento,
    type: 'site',
  },
  {
    id: 'pagina-captura',
    name: 'Página de Captura',
    description: 'Captura de leads com formulário de contato',
    image: templatePaginaCaptura,
    type: 'site',
  },
  {
    id: 'ecommerce-simples',
    name: 'E-commerce Simples',
    description: 'Loja virtual com catálogo e carrinho de compras',
    image: templateEcommerceSimples,
    type: 'site',
  },
  {
    id: 'negocio-local',
    name: 'Site para Negócio Local',
    description: 'Presença online para negócios da sua região',
    image: templateNegocioLocal,
    type: 'site',
  },
  {
    id: 'portfolio',
    name: 'Portfólio / Apresentação',
    description: 'Showcase de trabalhos e projetos criativos',
    image: templatePortfolio,
    type: 'site',
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type') as SolutionType;
  
  const [solutionType, setSolutionType] = useState<SolutionType>(typeFromUrl);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Update solutionType if URL param changes
  useEffect(() => {
    if (typeFromUrl) {
      setSolutionType(typeFromUrl);
    }
  }, [typeFromUrl]);

  const handleSelectSolutionType = (type: SolutionType) => {
    setSolutionType(type);
    setSelectedTemplate(null);
    toast.success(`Tipo "${type === 'app' ? 'Aplicativo / SaaS' : 'Site / Página Web'}" selecionado!`);
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    toast.success(`Modelo "${template?.name}" selecionado!`);
    // Navigate directly to materializar
    navigate('/solucoes/materializar', { 
      state: { 
        templateId: templateId,
        solutionType: solutionType
      } 
    });
  };

  const handleBack = () => {
    if (solutionType && !typeFromUrl) {
      // Only go back to type selection if we didn't come from a typed URL
      setSolutionType(null);
      setSelectedTemplate(null);
    } else {
      // Go back to the appropriate hub
      if (solutionType === 'app') {
        navigate('/solucoes/criar/app');
      } else if (solutionType === 'site') {
        navigate('/solucoes/criar/site');
      } else {
        navigate('/solucoes');
      }
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.type === solutionType || t.type === 'both'
  );

  // Step 1: Solution Type Selection
  if (!solutionType) {
    return (
      <AppLayout title="Tipo de Solução">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/solucoes')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Qual tipo de solução você quer criar?</h1>
              <p className="text-muted-foreground">
                Escolha o tipo de projeto que melhor atende suas necessidades
              </p>
            </div>
          </div>

          {/* Solution Type Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* App/SaaS Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/50 overflow-hidden"
              onClick={() => handleSelectSolutionType('app')}
            >
              <CardContent className="p-0">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={solutionTypeApp} 
                    alt="Aplicativo / SaaS" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Smartphone className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Aplicativo / SaaS
                  </h3>
                  <p className="text-muted-foreground">
                    Apps, sistemas, plataformas e soluções interativas.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">Agendamento</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">Pedidos</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">Gestão</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Site Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/50 overflow-hidden"
              onClick={() => handleSelectSolutionType('site')}
            >
              <CardContent className="p-0">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={solutionTypeSite} 
                    alt="Site / Página Web" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                    Site / Página Web
                  </h3>
                  <p className="text-muted-foreground">
                    Landing pages, páginas de venda, sites institucionais e e-commerce.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-500">Landing Page</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-500">E-commerce</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-500">Institucional</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Step 2: Template Selection
  return (
    <AppLayout title="Modelos Prontos">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {solutionType === 'app' ? (
                  <Smartphone className="h-5 w-5 text-primary" />
                ) : (
                  <Globe className="h-5 w-5 text-emerald-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {solutionType === 'app' ? 'Aplicativo / SaaS' : 'Site / Página Web'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Escolha um Modelo</h1>
              <p className="text-muted-foreground">
                Selecione o tipo de negócio que melhor representa seu projeto
              </p>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-[hsl(228,12%,10%)] border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(268,60%,50%/0.15)] hover:-translate-y-1"
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* Image Area */}
              <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
                <img 
                  src={template.image} 
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(228,12%,10%)] via-transparent to-transparent" />
                
                {/* Badge Pronto para usar */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-success/90 text-success-foreground text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Pronto para usar
                </div>

              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 space-y-3">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
