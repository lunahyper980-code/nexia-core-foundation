import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Configuração centralizada de breadcrumbs por rota
const BREADCRUMB_CONFIG: Record<string, BreadcrumbItem[]> = {
  // Dashboard
  '/dashboard': [{ label: 'Dashboard' }],
  '/': [{ label: 'Dashboard' }],

  // Encontrar Clientes
  '/encontrar-clientes': [{ label: 'Encontrar Clientes' }],

  // Nexia AI
  '/nexia-ai': [{ label: 'Nexia' }],
  '/nexia-ai/planejamento/novo': [
    { label: 'Nexia', href: '/nexia-ai' },
    { label: 'Criar Planejamento' },
  ],
  '/nexia-ai/planejamentos': [
    { label: 'Nexia', href: '/nexia-ai' },
    { label: 'Planejamentos' },
  ],
  '/nexia-ai/clientes': [
    { label: 'Nexia', href: '/nexia-ai' },
    { label: 'Clientes' },
  ],
  '/nexia-ai/tarefas': [
    { label: 'Nexia', href: '/nexia-ai' },
    { label: 'Tarefas' },
  ],
  '/nexia-ai/historico': [
    { label: 'Nexia', href: '/nexia-ai' },
    { label: 'Histórico' },
  ],
  '/nexia-ai/diagnostico-rapido': [
    { label: 'Nexia', href: '/nexia-ai' },
    { label: 'Diagnóstico Rápido' },
  ],
  '/nexia-ai/diagnostico-avancado': [
    { label: 'Nexia', href: '/nexia-ai' },
    { label: 'Diagnóstico Avançado' },
  ],

  // Soluções Digitais
  '/solucoes': [{ label: 'Soluções Digitais' }],
  '/solucoes/criar/app': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'App / SaaS' },
  ],
  '/solucoes/criar/app/novo': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'App / SaaS', href: '/solucoes/criar/app' },
    { label: 'Criar App' },
  ],
  '/solucoes/criar/site': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Site / Página' },
  ],
  '/solucoes/criar/site/novo': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Site / Página', href: '/solucoes/criar/site' },
    { label: 'Criar Site' },
  ],
  '/solucoes/templates': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Templates' },
  ],
  '/solucoes/diagnostico': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Diagnóstico Digital' },
  ],
  '/solucoes/diagnostico/novo': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Diagnóstico Digital', href: '/solucoes/diagnostico' },
    { label: 'Novo Diagnóstico' },
  ],
  '/solucoes/posicionamento': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Posicionamento Digital' },
  ],
  '/solucoes/posicionamento/novo': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Posicionamento Digital', href: '/solucoes/posicionamento' },
    { label: 'Novo Posicionamento' },
  ],
  '/solucoes/organizacao': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Organização de Processos' },
  ],
  '/solucoes/organizacao/novo': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Organização de Processos', href: '/solucoes/organizacao' },
    { label: 'Nova Organização' },
  ],
  '/solucoes/kit-lancamento': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Kit de Lançamento' },
  ],
  '/solucoes/kit-lancamento/novo': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Kit de Lançamento', href: '/solucoes/kit-lancamento' },
    { label: 'Novo Kit' },
  ],
  '/solucoes/autoridade': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Autoridade Digital' },
  ],
  '/solucoes/autoridade/novo': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Autoridade Digital', href: '/solucoes/autoridade' },
    { label: 'Nova Estratégia' },
  ],
  '/solucoes/proposta': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Proposta' },
  ],
  '/solucoes/contrato': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Contrato' },
  ],

  // Materializar
  '/solucoes/materializar': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Materializar Projeto' },
  ],

  // Criar do Zero
  '/solucoes/criar': [
    { label: 'Soluções Digitais', href: '/solucoes' },
    { label: 'Criar do Zero' },
  ],

  // Vendas
  '/vendas': [{ label: 'Vendas' }],
  '/vendas/propostas': [
    { label: 'Vendas', href: '/vendas' },
    { label: 'Propostas' },
  ],
  '/vendas/propostas/nova': [
    { label: 'Vendas', href: '/vendas' },
    { label: 'Propostas', href: '/vendas/propostas' },
    { label: 'Criar' },
  ],
  '/vendas/contratos': [
    { label: 'Vendas', href: '/vendas' },
    { label: 'Contratos' },
  ],
  '/vendas/contratos/novo': [
    { label: 'Vendas', href: '/vendas' },
    { label: 'Contratos', href: '/vendas/contratos' },
    { label: 'Criar' },
  ],
  '/vendas/whatsapp': [
    { label: 'Vendas', href: '/vendas' },
    { label: 'Mensagens' },
  ],

  // Clientes
  '/clientes': [{ label: 'Clientes' }],

  // Identidade
  '/identidade': [{ label: 'Identidade' }],

  // Academy
  '/academy': [{ label: 'Academy' }],
  '/academy/guia-iniciante': [
    { label: 'Academy', href: '/academy' },
    { label: 'Guia Nexia' },
  ],
  '/academy/guia-agencia': [
    { label: 'Academy', href: '/academy' },
    { label: 'Passo a Passo' },
  ],
  '/academy/faq': [
    { label: 'Academy', href: '/academy' },
    { label: 'FAQ + Suporte' },
  ],

  // Histórico
  '/historico': [{ label: 'Histórico' }],

  // Configurações
  '/configuracoes': [{ label: 'Configurações' }],

  // Entregas
  '/entrega': [{ label: 'Entregas' }],
  '/entrega/nova': [
    { label: 'Entregas', href: '/entrega' },
    { label: 'Nova Entrega' },
  ],
};

// Função para encontrar breadcrumb por padrão de rota dinâmica
function findBreadcrumbForPath(pathname: string): BreadcrumbItem[] | null {
  // Primeiro, tenta match exato
  if (BREADCRUMB_CONFIG[pathname]) {
    return BREADCRUMB_CONFIG[pathname];
  }

  // Padrões dinâmicos
  const dynamicPatterns = [
    // Nexia planejamentos
    {
      pattern: /^\/nexia-ai\/planejamento\/([^/]+)$/,
      breadcrumb: [
        { label: 'Nexia', href: '/nexia-ai' },
        { label: 'Planejamentos', href: '/nexia-ai/planejamentos' },
        { label: 'Planejamento em andamento' },
      ],
    },
    // Projetos - Projeto selecionado
    {
      pattern: /^\/hyperbuild\/projeto\/([^/]+)$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Projeto selecionado' },
      ],
    },
    // Projetos - Editar
    {
      pattern: /^\/hyperbuild\/projeto\/([^/]+)\/editar$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Projeto', href: '/solucoes' },
        { label: 'Editar' },
      ],
    },
    // Projetos - Contrato
    {
      pattern: /^\/hyperbuild\/projeto\/([^/]+)\/contrato$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Projeto', href: '/solucoes' },
        { label: 'Contrato' },
      ],
    },
    // Vendas - Proposta específica
    {
      pattern: /^\/vendas\/propostas\/([^/]+)$/,
      breadcrumb: [
        { label: 'Vendas', href: '/vendas' },
        { label: 'Propostas', href: '/vendas/propostas' },
        { label: 'Detalhes' },
      ],
    },
    // Vendas - Contrato específico
    {
      pattern: /^\/vendas\/contratos\/([^/]+)$/,
      breadcrumb: [
        { label: 'Vendas', href: '/vendas' },
        { label: 'Contratos', href: '/vendas/contratos' },
        { label: 'Detalhes' },
      ],
    },
    // Diagnóstico específico
    {
      pattern: /^\/solucoes\/diagnostico\/([^/]+)$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Diagnóstico Digital', href: '/solucoes/diagnostico' },
        { label: 'Detalhes' },
      ],
    },
    // Posicionamento específico
    {
      pattern: /^\/solucoes\/posicionamento\/([^/]+)$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Posicionamento Digital', href: '/solucoes/posicionamento' },
        { label: 'Detalhes' },
      ],
    },
    // Organização específica
    {
      pattern: /^\/solucoes\/organizacao\/([^/]+)$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Organização de Processos', href: '/solucoes/organizacao' },
        { label: 'Detalhes' },
      ],
    },
    // Kit de Lançamento específico
    {
      pattern: /^\/solucoes\/kit-lancamento\/([^/]+)$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Kit de Lançamento', href: '/solucoes/kit-lancamento' },
        { label: 'Detalhes' },
      ],
    },
    // Autoridade específica
    {
      pattern: /^\/solucoes\/autoridade\/([^/]+)$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Autoridade Digital', href: '/solucoes/autoridade' },
        { label: 'Detalhes' },
      ],
    },
    // Cliente específico
    {
      pattern: /^\/clientes\/([^/]+)$/,
      breadcrumb: [
        { label: 'Clientes', href: '/clientes' },
        { label: 'Cliente selecionado' },
      ],
    },
    // Contrato de solução
    {
      pattern: /^\/solucoes\/contrato\/([^/]+)$/,
      breadcrumb: [
        { label: 'Soluções Digitais', href: '/solucoes' },
        { label: 'Contrato' },
      ],
    },
  ];

  for (const { pattern, breadcrumb } of dynamicPatterns) {
    if (pattern.test(pathname)) {
      return breadcrumb;
    }
  }

  return null;
}

interface GlobalBreadcrumbProps {
  className?: string;
  customItems?: BreadcrumbItem[];
}

export function GlobalBreadcrumb({ className, customItems }: GlobalBreadcrumbProps) {
  const location = useLocation();
  
  // Se tiver items customizados, usa eles
  const items = customItems || findBreadcrumbForPath(location.pathname);

  // Não renderiza se não tiver items ou só tiver 1 item (página raiz)
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center gap-1.5 text-sm mb-1",
        className
      )}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              )}
              {isLast ? (
                <span 
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link 
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-muted-foreground">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default GlobalBreadcrumb;
