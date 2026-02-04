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
import templateRestauranteBar from '@/assets/template-restaurante-bar.png';
import templatePrestadorServicos from '@/assets/template-prestador-servicos.png';
import templateEscritorioProfissional from '@/assets/template-escritorio-profissional.png';
import templateEvento from '@/assets/template-evento.png';
import templateRestaurante from '@/assets/template-restaurante.png';

type SolutionType = 'app' | 'site' | null;
type CategoryType = 'all' | string;

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'app' | 'site' | 'both';
  category: string;
}

// Categorias para Apps
const appCategories = [
  { id: 'all', label: 'Todos' },
  { id: 'alimentacao', label: 'Alimentação' },
  { id: 'beleza', label: 'Beleza & Estética' },
  { id: 'saude', label: 'Saúde' },
  { id: 'comercio', label: 'Comércio' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'educacao', label: 'Educação' },
];

// Categorias para Sites
const siteCategories = [
  { id: 'all', label: 'Todos' },
  { id: 'marketing', label: 'Marketing & Vendas' },
  { id: 'institucional', label: 'Institucional' },
  { id: 'comercio', label: 'Comércio' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'profissional', label: 'Profissional' },
];

const templates: Template[] = [
  // App/SaaS Templates - Alimentação
  {
    id: 'pizzaria',
    name: 'Pizzaria',
    description: 'Cardápio digital e pedidos online para pizzarias',
    image: templatePizzaria,
    type: 'app',
    category: 'alimentacao',
  },
  {
    id: 'hamburgueria',
    name: 'Hamburgueria',
    description: 'Menu interativo e delivery para hamburguerias',
    image: templateHamburgueria,
    type: 'app',
    category: 'alimentacao',
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    description: 'Vitrine digital e fidelidade para cafeterias',
    image: templateCafeteria,
    type: 'app',
    category: 'alimentacao',
  },
  {
    id: 'delivery',
    name: 'Delivery',
    description: 'Sistema completo de entregas e rastreamento de pedidos',
    image: templateDelivery,
    type: 'app',
    category: 'alimentacao',
  },
  {
    id: 'restaurante',
    name: 'Restaurante',
    description: 'Cardápio digital, reservas e pedidos para restaurantes',
    image: templateRestaurante,
    type: 'app',
    category: 'alimentacao',
  },
  // App/SaaS Templates - Beleza
  {
    id: 'barbearia',
    name: 'Barbearia',
    description: 'Agendamento online e portfólio para barbearias',
    image: templateBarbearia,
    type: 'app',
    category: 'beleza',
  },
  {
    id: 'nail-designer',
    name: 'Nail Designer',
    description: 'Catálogo de trabalhos e agendamento para nail designers',
    image: templateNailDesigner,
    type: 'app',
    category: 'beleza',
  },
  {
    id: 'studio-estetica',
    name: 'Studio de Estética & Spa',
    description: 'Agenda, catálogo e fidelidade para studios de estética',
    image: templateStudioEstetica,
    type: 'app',
    category: 'beleza',
  },
  // App/SaaS Templates - Saúde
  {
    id: 'clinica-consultorio',
    name: 'Clínica & Consultório',
    description: 'Agendamento e gestão profissional para clínicas e consultórios',
    image: templateClinicaConsultorio,
    type: 'app',
    category: 'saude',
  },
  {
    id: 'academia',
    name: 'Academia',
    description: 'Planos, treinos e agendamento para academias',
    image: templateAcademia,
    type: 'app',
    category: 'saude',
  },
  // App/SaaS Templates - Comércio
  {
    id: 'loja-roupas',
    name: 'Loja de Roupas',
    description: 'Vitrine virtual e catálogo para lojas de moda',
    image: templateLojaRoupas,
    type: 'both',
    category: 'comercio',
  },
  {
    id: 'loja-cosmeticos',
    name: 'Loja de Cosméticos & Perfumaria',
    description: 'Vitrine digital para lojas de cosméticos e perfumaria',
    image: templateLojaCosmeticos,
    type: 'app',
    category: 'comercio',
  },
  {
    id: 'pet-shop',
    name: 'Pet Shop',
    description: 'Serviços, produtos e agendamento para pet shops',
    image: templatePetShop,
    type: 'app',
    category: 'comercio',
  },
  // App/SaaS Templates - Serviços
  {
    id: 'mecanica',
    name: 'Mecânica',
    description: 'Orçamentos e agendamento para oficinas mecânicas',
    image: templateMecanica,
    type: 'app',
    category: 'servicos',
  },
  {
    id: 'agendamento',
    name: 'Agendamento',
    description: 'Sistema de reservas e gestão de horários',
    image: templateAgendamento,
    type: 'app',
    category: 'servicos',
  },
  {
    id: 'corretor-imobiliaria',
    name: 'Imobiliária & Corretor',
    description: 'Portfólio de imóveis e agendamento de visitas',
    image: templateCorretorImobiliaria,
    type: 'app',
    category: 'servicos',
  },
  // App/SaaS Templates - Educação
  {
    id: 'escola-curso-local',
    name: 'Escola & Curso Local',
    description: 'Gestão de alunos, aulas e comunicação para escolas locais',
    image: templateEscolaCurso,
    type: 'app',
    category: 'educacao',
  },
  // Site Templates - Marketing & Vendas
  {
    id: 'landing-page-vendas',
    name: 'Landing Page / Página de Vendas',
    description: 'Página persuasiva para converter visitantes em clientes',
    image: templateLandingPage,
    type: 'site',
    category: 'marketing',
  },
  {
    id: 'site-institucional',
    name: 'Site Institucional',
    description: 'Apresentação profissional da sua empresa e serviços',
    image: templateSiteInstitucional,
    type: 'site',
    category: 'institucional',
  },
  {
    id: 'pagina-mentoria',
    name: 'Página de Mentoria',
    description: 'Apresentação de programa de mentoria, coaching ou consultoria',
    image: templatePaginaMentoria,
    type: 'site',
    category: 'marketing',
  },
  {
    id: 'pagina-lancamento',
    name: 'Página de Lançamento',
    description: 'Página para lançamento de produtos, cursos ou serviços',
    image: templatePaginaLancamento,
    type: 'site',
    category: 'marketing',
  },
  {
    id: 'pagina-captura',
    name: 'Página de Captura',
    description: 'Captura de leads e contatos com formulário otimizado',
    image: templatePaginaCaptura,
    type: 'site',
    category: 'marketing',
  },
  {
    id: 'ecommerce-simples',
    name: 'E-commerce Simples',
    description: 'Loja virtual com catálogo de produtos e carrinho de compras',
    image: templateEcommerceSimples,
    type: 'site',
    category: 'comercio',
  },
  {
    id: 'negocio-local',
    name: 'Site para Negócio Local',
    description: 'Presença online profissional para negócios da sua região',
    image: templateNegocioLocal,
    type: 'site',
    category: 'institucional',
  },
  {
    id: 'portfolio',
    name: 'Portfólio / Apresentação',
    description: 'Showcase de trabalhos e projetos para profissionais criativos',
    image: templatePortfolio,
    type: 'site',
    category: 'profissional',
  },
  {
    id: 'site-barbearia',
    name: 'Site para Barbearia',
    description: 'Presença digital profissional para barbearias e barbeiros autônomos',
    image: templateBarbearia,
    type: 'site',
    category: 'servicos',
  },
  // New Site Templates
  {
    id: 'site-clinica-consultorio',
    name: 'Site para Clínica / Consultório',
    description: 'Presença profissional para clínicas, consultórios e profissionais da saúde',
    image: templateClinicaConsultorio,
    type: 'site',
    category: 'servicos',
  },
  {
    id: 'site-salao-estetica',
    name: 'Site para Salão de Beleza / Estética',
    description: 'Vitrine digital para salões, estúdios de beleza e estética',
    image: templateStudioEstetica,
    type: 'site',
    category: 'servicos',
  },
  {
    id: 'site-restaurante-bar',
    name: 'Site para Restaurante / Bar',
    description: 'Cardápio, localização e reservas para restaurantes e bares',
    image: templateRestauranteBar,
    type: 'site',
    category: 'servicos',
  },
  {
    id: 'site-imobiliaria-corretor',
    name: 'Site para Imobiliária / Corretor',
    description: 'Portfólio de imóveis e atendimento para corretores e imobiliárias',
    image: templateCorretorImobiliaria,
    type: 'site',
    category: 'servicos',
  },
  {
    id: 'site-prestador-servicos',
    name: 'Site para Prestador de Serviços',
    description: 'Apresentação profissional para prestadores de serviços autônomos',
    image: templatePrestadorServicos,
    type: 'site',
    category: 'servicos',
  },
  {
    id: 'site-escola-curso',
    name: 'Site para Escola / Curso / Treinamento',
    description: 'Presença digital para escolas, cursos e centros de treinamento',
    image: templateEscolaCurso,
    type: 'site',
    category: 'servicos',
  },
  {
    id: 'site-escritorio-profissional',
    name: 'Site para Escritório Profissional',
    description: 'Site institucional para escritórios de advocacia, contabilidade e afins',
    image: templateEscritorioProfissional,
    type: 'site',
    category: 'profissional',
  },
  {
    id: 'site-evento',
    name: 'Site para Evento',
    description: 'Página para divulgação de eventos, conferências e workshops',
    image: templateEvento,
    type: 'site',
    category: 'marketing',
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type') as SolutionType;
  
  const [solutionType, setSolutionType] = useState<SolutionType>(typeFromUrl);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

  // Update solutionType if URL param changes
  useEffect(() => {
    if (typeFromUrl) {
      setSolutionType(typeFromUrl);
    }
  }, [typeFromUrl]);

  // Reset category when solution type changes
  useEffect(() => {
    setSelectedCategory('all');
  }, [solutionType]);

  const handleSelectSolutionType = (type: SolutionType) => {
    setSolutionType(type);
    setSelectedTemplate(null);
    setSelectedCategory('all');
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
      setSelectedCategory('all');
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

  // Get current categories based on solution type
  const currentCategories = solutionType === 'app' ? appCategories : siteCategories;

  // Filter templates by type and category
  const filteredTemplates = templates.filter(t => {
    const matchesType = t.type === solutionType || t.type === 'both';
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesType && matchesCategory;
  });

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

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {currentCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedCategory === category.id
                  ? solutionType === 'app'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              {category.label}
              {selectedCategory === category.id && (
                <span className="ml-2 text-xs opacity-80">
                  ({filteredTemplates.length})
                </span>
              )}
            </button>
          ))}
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
