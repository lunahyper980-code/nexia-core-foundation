// Configurações de campos dinâmicos por tipo de site

export interface FieldConfig {
  id: string;
  label: string;
  placeholder: string;
  type: 'input' | 'textarea' | 'select' | 'checkbox-group';
  options?: { id: string; label: string }[];
  required?: boolean;
  rows?: number;
}

export interface SiteTypeConfig {
  id: string;
  label: string;
  description: string;
  sections: { id: string; label: string; description: string }[];
  fields: FieldConfig[];
  suggestedSections: string[];
}

export const siteTypeOptions = [
  { id: 'landing-page', label: 'Landing Page', description: 'Página única de conversão' },
  { id: 'pagina-vendas', label: 'Página de Vendas', description: 'Vender produto ou serviço' },
  { id: 'captura-leads', label: 'Captura de Leads', description: 'Coletar emails e contatos' },
  { id: 'institucional', label: 'Site Institucional', description: 'Apresentar empresa' },
  { id: 'portfolio', label: 'Portfólio', description: 'Mostrar trabalhos' },
  { id: 'lancamento', label: 'Página de Lançamento', description: 'Lançar produto novo' },
  { id: 'ecommerce', label: 'E-commerce', description: 'Loja virtual com produtos' },
  { id: 'outro', label: 'Outro', description: 'Tipo personalizado' },
];

// Seções sugeridas por tipo de site
export const sectionsByType: Record<string, { id: string; label: string; description: string }[]> = {
  'landing-page': [
    { id: 'hero', label: 'Hero / Cabeçalho', description: 'Título principal e CTA' },
    { id: 'problema', label: 'Problema / Dor', description: 'O que o cliente sofre' },
    { id: 'solucao', label: 'Solução', description: 'Como você resolve' },
    { id: 'beneficios', label: 'Benefícios', description: 'Vantagens do produto' },
    { id: 'depoimentos', label: 'Depoimentos', description: 'Prova social' },
    { id: 'cta-final', label: 'CTA Final', description: 'Chamada para ação' },
    { id: 'faq', label: 'FAQ', description: 'Perguntas frequentes' },
  ],
  'pagina-vendas': [
    { id: 'hero', label: 'Hero com Oferta', description: 'Título e proposta de valor' },
    { id: 'video-vendas', label: 'Vídeo de Vendas', description: 'VSL ou apresentação' },
    { id: 'problema', label: 'Problema / Dor', description: 'A dor do cliente' },
    { id: 'solucao', label: 'A Transformação', description: 'O que ele vai conquistar' },
    { id: 'beneficios', label: 'Benefícios', description: 'Lista de ganhos' },
    { id: 'bonus', label: 'Bônus', description: 'Ofertas extras' },
    { id: 'depoimentos', label: 'Depoimentos', description: 'Resultados de clientes' },
    { id: 'garantia', label: 'Garantia', description: 'Política de devolução' },
    { id: 'precos', label: 'Oferta / Preço', description: 'Valor e condições' },
    { id: 'cta-final', label: 'CTA Final', description: 'Última chamada' },
    { id: 'faq', label: 'FAQ', description: 'Objeções respondidas' },
  ],
  'captura-leads': [
    { id: 'hero', label: 'Hero com Formulário', description: 'Título e captura' },
    { id: 'beneficios', label: 'O que você vai receber', description: 'Benefícios do material' },
    { id: 'sobre-autor', label: 'Sobre o Autor', description: 'Credibilidade' },
    { id: 'depoimentos', label: 'Depoimentos', description: 'Quem já baixou' },
    { id: 'cta-final', label: 'CTA Final', description: 'Formulário repetido' },
  ],
  'institucional': [
    { id: 'hero', label: 'Hero Institucional', description: 'Apresentação da empresa' },
    { id: 'sobre', label: 'Sobre a Empresa', description: 'História e valores' },
    { id: 'servicos', label: 'Serviços', description: 'O que oferecemos' },
    { id: 'equipe', label: 'Equipe', description: 'Nosso time' },
    { id: 'clientes', label: 'Clientes / Parceiros', description: 'Quem confia em nós' },
    { id: 'depoimentos', label: 'Depoimentos', description: 'O que dizem' },
    { id: 'contato', label: 'Contato', description: 'Formulário e dados' },
  ],
  'portfolio': [
    { id: 'hero', label: 'Hero / Apresentação', description: 'Quem sou eu' },
    { id: 'sobre', label: 'Sobre Mim', description: 'Minha história' },
    { id: 'habilidades', label: 'Habilidades', description: 'O que sei fazer' },
    { id: 'projetos', label: 'Projetos / Trabalhos', description: 'Galeria de trabalhos' },
    { id: 'servicos', label: 'Serviços', description: 'Como posso ajudar' },
    { id: 'depoimentos', label: 'Depoimentos', description: 'Feedback de clientes' },
    { id: 'contato', label: 'Contato', description: 'Entre em contato' },
  ],
  'lancamento': [
    { id: 'hero', label: 'Hero de Lançamento', description: 'O grande anúncio' },
    { id: 'countdown', label: 'Countdown', description: 'Contagem regressiva' },
    { id: 'teaser', label: 'Teaser / Preview', description: 'Prévia do produto' },
    { id: 'beneficios', label: 'Benefícios', description: 'Por que esperar' },
    { id: 'captura', label: 'Lista de Espera', description: 'Formulário de interesse' },
    { id: 'faq', label: 'FAQ', description: 'Perguntas sobre o lançamento' },
  ],
  'ecommerce': [
    { id: 'hero', label: 'Banner Principal', description: 'Destaque e promoções' },
    { id: 'categorias', label: 'Categorias', description: 'Navegação por categoria' },
    { id: 'produtos-destaque', label: 'Produtos em Destaque', description: 'Best-sellers' },
    { id: 'promocoes', label: 'Promoções', description: 'Ofertas especiais' },
    { id: 'beneficios', label: 'Benefícios da Loja', description: 'Frete, garantia, etc.' },
    { id: 'depoimentos', label: 'Avaliações', description: 'Reviews de clientes' },
    { id: 'newsletter', label: 'Newsletter', description: 'Captura de email' },
    { id: 'footer', label: 'Footer Completo', description: 'Links e informações' },
  ],
  'outro': [
    { id: 'hero', label: 'Hero / Cabeçalho', description: 'Seção principal' },
    { id: 'sobre', label: 'Sobre', description: 'Informações gerais' },
    { id: 'servicos', label: 'Serviços / Produtos', description: 'O que oferece' },
    { id: 'beneficios', label: 'Benefícios', description: 'Vantagens' },
    { id: 'depoimentos', label: 'Depoimentos', description: 'Prova social' },
    { id: 'contato', label: 'Contato', description: 'Formulário' },
    { id: 'faq', label: 'FAQ', description: 'Perguntas frequentes' },
  ],
};

// Campos específicos por tipo de site (Etapa 2 - Contexto)
export const fieldsByType: Record<string, FieldConfig[]> = {
  'landing-page': [
    { id: 'mainObjective', label: 'Qual o objetivo principal da landing page?', placeholder: 'Ex: Vender um curso, captar leads, agendar consultas...', type: 'textarea', rows: 2 },
    { id: 'valueProposition', label: 'Qual sua proposta de valor única?', placeholder: 'Ex: Emagreça 10kg em 90 dias sem dietas restritivas', type: 'textarea', rows: 2 },
    { id: 'mainCTA', label: 'Qual a ação principal que o visitante deve fazer?', placeholder: 'Ex: Comprar agora, Agendar consulta, Baixar ebook...', type: 'input' },
    { id: 'urgency', label: 'Existe algum gatilho de urgência?', placeholder: 'Ex: Oferta válida até 31/12, Apenas 10 vagas...', type: 'input' },
  ],
  'pagina-vendas': [
    { id: 'productName', label: 'Nome do produto/serviço', placeholder: 'Ex: Curso Método XYZ, Consultoria Premium...', type: 'input' },
    { id: 'productType', label: 'Tipo de produto', placeholder: 'Ex: Curso online, E-book, Mentoria, Serviço...', type: 'input' },
    { id: 'transformation', label: 'Qual transformação o cliente terá?', placeholder: 'Ex: Sair de 0 a 10k em 90 dias, Emagrecer 15kg...', type: 'textarea', rows: 2 },
    { id: 'price', label: 'Valor e condições de pagamento', placeholder: 'Ex: 12x de R$97 ou R$997 à vista', type: 'input' },
    { id: 'guarantee', label: 'Qual a garantia oferecida?', placeholder: 'Ex: 7 dias de garantia incondicional', type: 'input' },
    { id: 'bonuses', label: 'Quais bônus você oferece?', placeholder: 'Ex: Grupo VIP, Templates, Mentoria de bônus...', type: 'textarea', rows: 2 },
  ],
  'captura-leads': [
    { id: 'leadMagnet', label: 'O que você está oferecendo em troca do email?', placeholder: 'Ex: E-book gratuito, Checklist, Aula grátis, Planilha...', type: 'input' },
    { id: 'leadMagnetBenefit', label: 'Qual o principal benefício do material?', placeholder: 'Ex: Aprenda a investir do zero em 7 passos', type: 'textarea', rows: 2 },
    { id: 'targetProblem', label: 'Qual problema do lead você vai resolver?', placeholder: 'Ex: Não sabe por onde começar a investir...', type: 'textarea', rows: 2 },
  ],
  'institucional': [
    { id: 'companyHistory', label: 'Conte brevemente a história da empresa', placeholder: 'Ex: Fundada em 2010, a empresa XYZ nasceu...', type: 'textarea', rows: 3 },
    { id: 'mission', label: 'Qual a missão da empresa?', placeholder: 'Ex: Transformar a vida das pessoas através da educação...', type: 'textarea', rows: 2 },
    { id: 'mainServices', label: 'Quais são os principais serviços/produtos?', placeholder: 'Ex: Consultoria, Treinamentos, Software...', type: 'textarea', rows: 2 },
    { id: 'differentials', label: 'Quais são os diferenciais da empresa?', placeholder: 'Ex: 15 anos no mercado, equipe especializada...', type: 'textarea', rows: 2 },
  ],
  'portfolio': [
    { id: 'profession', label: 'Qual sua profissão/área de atuação?', placeholder: 'Ex: Designer, Desenvolvedor, Fotógrafo...', type: 'input' },
    { id: 'bio', label: 'Escreva uma breve bio sobre você', placeholder: 'Ex: Sou designer com 8 anos de experiência...', type: 'textarea', rows: 3 },
    { id: 'skills', label: 'Quais são suas principais habilidades?', placeholder: 'Ex: UI/UX Design, Branding, Ilustração...', type: 'textarea', rows: 2 },
    { id: 'projectTypes', label: 'Que tipos de projetos você quer destacar?', placeholder: 'Ex: Logos, Sites, Apps, Ilustrações...', type: 'textarea', rows: 2 },
    { id: 'workStyle', label: 'Como você trabalha?', placeholder: 'Ex: Remoto, Freelancer, Disponível para contratos...', type: 'input' },
  ],
  'lancamento': [
    { id: 'productName', label: 'Nome do produto que será lançado', placeholder: 'Ex: Curso Revolucionário XYZ', type: 'input' },
    { id: 'launchDate', label: 'Quando será o lançamento?', placeholder: 'Ex: 15 de Janeiro de 2025', type: 'input' },
    { id: 'productTeaser', label: 'Descreva brevemente o produto (teaser)', placeholder: 'Ex: O método que vai transformar sua forma de...', type: 'textarea', rows: 2 },
    { id: 'waitlistBenefit', label: 'O que a pessoa ganha entrando na lista de espera?', placeholder: 'Ex: Desconto exclusivo, Acesso antecipado...', type: 'textarea', rows: 2 },
  ],
  'ecommerce': [
    { id: 'storeName', label: 'Nome da Loja', placeholder: 'Ex: Loja Fashion, Tech Store...', type: 'input' },
    { id: 'productCategories', label: 'Categorias de Produtos', placeholder: 'Ex: Roupas, Eletrônicos, Acessórios, Calçados...', type: 'textarea', rows: 2 },
    { id: 'valueProposition', label: 'Proposta de Valor da Loja', placeholder: 'Ex: Moda sustentável com preço justo, Tecnologia com garantia estendida...', type: 'textarea', rows: 2 },
    { id: 'mainBanner', label: 'Texto do Banner Principal', placeholder: 'Ex: Até 50% OFF em toda a loja, Frete grátis acima de R$99...', type: 'input' },
    { id: 'riskFreePolicy', label: 'Políticas de Risco Zero (garantias)', placeholder: 'Ex: Troca grátis em 30 dias, Devolução garantida, Frete grátis...', type: 'textarea', rows: 2 },
    { id: 'shippingInfo', label: 'Informações de Entrega', placeholder: 'Ex: Entrega em até 3 dias úteis, Rastreio em tempo real...', type: 'input' },
  ],
  'outro': [
    { id: 'customType', label: 'Descreva o tipo de site que você quer criar', placeholder: 'Ex: Site para eventos, Blog pessoal, Plataforma de cursos...', type: 'textarea', rows: 2 },
    { id: 'mainPurpose', label: 'Qual o objetivo principal do site?', placeholder: 'Ex: Divulgar eventos, Compartilhar conteúdo, Vender acessos...', type: 'textarea', rows: 2 },
    { id: 'keyFeatures', label: 'Quais funcionalidades principais você precisa?', placeholder: 'Ex: Calendário, Área de membros, Galeria...', type: 'textarea', rows: 2 },
  ],
};

// Campos para Identidade Visual (comum a todos)
export const visualIdentityFields: FieldConfig[] = [
  { id: 'primaryColor', label: 'Cor Primária', placeholder: '#8000FF', type: 'input' },
  { id: 'secondaryColor', label: 'Cor Secundária', placeholder: '#1F1F1F', type: 'input' },
  { id: 'backgroundColor', label: 'Cor de Fundo', placeholder: '#171717', type: 'input' },
  { id: 'textColor', label: 'Cor do Texto', placeholder: '#FFFFFF', type: 'input' },
];

export const fontOptions = [
  'Inter',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Nunito',
  'Raleway',
  'Space Grotesk',
  'DM Sans',
  'Playfair Display',
  'Merriweather',
];

export const styleOptions = [
  { id: 'moderno', label: 'Moderno e Clean' },
  { id: 'ousado', label: 'Ousado e Impactante' },
  { id: 'elegante', label: 'Elegante e Sofisticado' },
  { id: 'minimalista', label: 'Minimalista' },
];
