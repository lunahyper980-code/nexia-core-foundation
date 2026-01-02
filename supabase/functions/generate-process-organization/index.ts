import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating process organization for:', organizationData.businessType);

    const systemPrompt = `Você é um consultor de processos especializado em pequenas e médias empresas brasileiras.
Sua função é criar estruturas de organização práticas, claras e prontas para uso profissional.

REGRAS CRÍTICAS DE FORMATAÇÃO:
- NUNCA retorne JSON, arrays, código ou estruturas técnicas
- NUNCA use aspas, colchetes, chaves ou marcadores como -, *, **
- NUNCA use linguagem de programação ou formatação técnica
- Escreva APENAS texto corrido, fluido e profissional
- Use parágrafos bem estruturados com linguagem de manual operacional
- O resultado deve parecer um documento de consultoria profissional

REGRAS DE CONTEÚDO:
- Use linguagem simples, direta e profissional
- Foque em soluções práticas e aplicáveis imediatamente
- Considere a realidade de pequenos negócios brasileiros
- Seja específico ao tipo de negócio informado
- Mantenha as recomendações realistas para o tamanho da equipe

ESTRUTURA DE RESPOSTA (6 blocos separados por ###):

###VISAO_GERAL###
Escreva 3 a 4 parágrafos explicando como a operação deve funcionar no dia a dia. 
Descreva a visão geral do negócio, a dinâmica de trabalho e o objetivo principal.

###PROBLEMAS_PROCESSO###
Descreva os principais problemas de processo identificados e como resolvê-los.
Use parágrafos corridos explicando cada problema e sua solução de forma clara.

###FLUXO_IDEAL###
Descreva o fluxo ideal de atendimento ao cliente, do primeiro contato à entrega.
Explique cada etapa de forma narrativa, como um guia de atendimento.

###ORGANIZACAO_INTERNA###
Explique quem faz o quê na equipe, divisão de responsabilidades por função.
Descreva de forma clara as atribuições de cada pessoa ou cargo.

###ROTINA_DIARIA###
Crie uma rotina recomendada organizada em três momentos:

Manhã (Antes de Abrir):
Descreva as tarefas de preparação do dia de forma narrativa.

Durante o Expediente:
Descreva as responsabilidades durante o funcionamento.

Final do Expediente:
Descreva as tarefas de fechamento e preparação do próximo dia.

###ROTINA_SEMANAL###
Crie uma rotina semanal organizada em três momentos:

Início da Semana:
Explique reuniões, alinhamento de metas e organização inicial.

Meio da Semana:
Descreva manutenção, ajustes operacionais e acompanhamento.

Final da Semana:
Explique fechamento estratégico, revisão e preparação para a próxima semana.

###PONTOS_ATENCAO###
Descreva pontos de atenção e sugestões de melhoria contínua.
Escreva como recomendações finais de um consultor experiente.`;

    const userPrompt = `Crie uma organização de processos completa para o seguinte negócio:

TIPO DE NEGÓCIO: ${organizationData.businessType}
TAMANHO DA EQUIPE: ${organizationData.teamSize}
CANAIS DE ATENDIMENTO: ${organizationData.contactChannels}
ONDE SE PERDE MAIS TEMPO: ${organizationData.timeWasteAreas}
PRINCIPAL PROBLEMA INTERNO: ${organizationData.mainInternalProblem}
OBJETIVO COM A ORGANIZAÇÃO: ${organizationData.organizationGoal}

Gere o conteúdo seguindo EXATAMENTE a estrutura solicitada, usando os separadores ### para cada bloco.
Lembre-se: texto profissional corrido, SEM JSON, SEM marcadores, SEM formatação técnica.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos para continuar.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from AI');
    }

    console.log('AI response received, parsing sections...');

    // Parse the structured response using ### separators
    const parseSection = (text: string, sectionName: string): string => {
      const regex = new RegExp(`###${sectionName}###([\\s\\S]*?)(?=###|$)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim()
          .replace(/^\*\*.*?\*\*\s*/gm, '') // Remove bold markdown
          .replace(/^\*\s*/gm, '') // Remove bullet points
          .replace(/^-\s*/gm, '') // Remove dashes
          .replace(/\[|\]|\{|\}/g, '') // Remove brackets
          .trim();
      }
      return '';
    };

    const operationOverview = parseSection(content, 'VISAO_GERAL');
    const processProblems = parseSection(content, 'PROBLEMAS_PROCESSO');
    const idealFlow = parseSection(content, 'FLUXO_IDEAL');
    const internalOrganization = parseSection(content, 'ORGANIZACAO_INTERNA');
    const dailyRoutine = parseSection(content, 'ROTINA_DIARIA');
    const weeklyRoutine = parseSection(content, 'ROTINA_SEMANAL');
    const attentionPoints = parseSection(content, 'PONTOS_ATENCAO');

    // Combine routines
    const recommendedRoutine = dailyRoutine + (weeklyRoutine ? '\n\n' + weeklyRoutine : '');

    console.log('Successfully generated process organization');

    return new Response(
      JSON.stringify({
        operationOverview: operationOverview || 'Conteúdo em processamento.',
        processProblems: processProblems || 'Conteúdo em processamento.',
        idealFlow: idealFlow || 'Conteúdo em processamento.',
        internalOrganization: internalOrganization || 'Conteúdo em processamento.',
        recommendedRoutine: recommendedRoutine || 'Conteúdo em processamento.',
        attentionPoints: attentionPoints || 'Conteúdo em processamento.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in generate-process-organization:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar organização de processos';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
