// Demo mode helper for edge functions
// When demo_mode is true, AI should generate complete output even with incomplete/random data

export function getDemoModeSystemPrompt(demoMode: boolean): string {
  if (!demoMode) return '';
  
  return `
IMPORTANTE - MODO DEMONSTRAÇÃO ATIVO:
Os dados fornecidos podem estar incompletos, genéricos ou aleatórios.
Você DEVE gerar uma resposta COMPLETA e PROFISSIONAL mesmo assim.

REGRAS DO MODO DEMO:
1. Mantenha 100% da estrutura padrão da entrega
2. Use tom profissional e controlado
3. Inclua avisos sutis quando apropriado, como:
   - "Com base nas informações disponíveis..."
   - "Considerando o contexto apresentado..."
   - "Esta análise considera um cenário ilustrativo..."
4. NUNCA gere erros ou interrompa o fluxo
5. NUNCA peça para corrigir dados
6. NUNCA simplifique a entrega
7. Gere conteúdo plausível e profissional

O objetivo é demonstrar a capacidade completa do sistema.
`;
}

export function getDemoModeContextNote(demoMode: boolean): string {
  if (!demoMode) return '';
  
  return `
[NOTA: Dados em contexto de demonstração - gerar análise completa com tom profissional]
`;
}
