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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { planningData } = await req.json();

    // Determinar solução prioritária baseada nos dados
    const determinePrioritySolution = () => {
      const solutionType = planningData.solutionType || '';
      const primaryGoal = planningData.primaryGoal || '';
      
      // Mapear tipo de solução para nome legível
      const solutionMap: Record<string, string> = {
        'app': 'Aplicativo Mobile/PWA',
        'site': 'Site Profissional',
        'landing_page': 'Landing Page de Conversão',
      };

      // Se já tem tipo de solução definido, usar
      if (solutionType && solutionMap[solutionType]) {
        return solutionMap[solutionType];
      }

      // Inferir baseado no objetivo
      if (primaryGoal.includes('vender') || primaryGoal.includes('captar')) {
        return 'Landing Page de Conversão';
      }
      if (primaryGoal.includes('organizar') || primaryGoal.includes('automatizar')) {
        return 'Aplicativo Mobile/PWA';
      }
      if (primaryGoal.includes('presenca') || primaryGoal.includes('profissional')) {
        return 'Site Profissional';
      }

      return 'Site Profissional';
    };

    // Determinar soluções complementares
    const determineComplementarySolutions = () => {
      const solutions: string[] = [];
      const primaryGoal = planningData.primaryGoal || '';
      const mainProblem = planningData.mainProblem || '';
      const solutionType = planningData.solutionType || '';

      // Baseado no objetivo e problema, sugerir complementos
      if (primaryGoal.includes('presenca') || mainProblem.includes('profissional') || mainProblem.includes('confiança')) {
        solutions.push('Autoridade e Reconhecimento Digital');
      }
      if (primaryGoal.includes('organizar') || mainProblem.includes('controle') || mainProblem.includes('processo')) {
        solutions.push('Organização de Processos');
      }
      if (!mainProblem.includes('marca') && !mainProblem.includes('logo')) {
        solutions.push('Kit de Lançamento Digital');
      }
      if (primaryGoal.includes('captar') || primaryGoal.includes('cliente')) {
        solutions.push('Posicionamento Digital');
      }

      // Remover duplicatas e limitar
      return [...new Set(solutions)].slice(0, 3);
    };

    const prioritySolution = determinePrioritySolution();
    const complementarySolutions = determineComplementarySolutions();

    const systemPrompt = `Você é um consultor de negócios digitais que analisa briefings e gera diagnósticos finais orientados à decisão.

REGRAS OBRIGATÓRIAS:
- Seja DIRETO e OBJETIVO
- Use linguagem SIMPLES, sem jargões técnicos de marketing
- Foque em DECISÃO e AÇÃO, não em descrição
- O objetivo é que o usuário saiba exatamente O QUE VENDER e POR ONDE COMEÇAR

VOCÊ DEVE RETORNAR UM JSON com exatamente esta estrutura:
{
  "diagnosticoFinal": "Um parágrafo curto e direto com o veredito sobre a situação do negócio. Não é resumo, é conclusão.",
  "problemaCentral": "Uma frase objetiva que o usuário possa repetir para o cliente. Ex: 'O principal gargalo é a ausência de um canal digital profissional.'",
  "proximoPasso": "Uma frase clara sobre o que fazer agora. Ex: 'O próximo passo é materializar a solução recomendada para apresentar ao cliente.'"
}

IMPORTANTE:
- diagnosticoFinal: Máximo 3 frases. Deve ser um veredito, não um resumo.
- problemaCentral: Máximo 1-2 frases. Algo que o usuário consiga repetir.
- proximoPasso: Máximo 1 frase. Instrução clara e direta.`;

    const userPrompt = `Analise este briefing e gere o diagnóstico final:

EMPRESA: ${planningData.companyName || 'Não informado'}
NICHO/SETOR: ${planningData.sectorNiche || 'Não informado'}
LOCALIZAÇÃO: ${planningData.location || 'Não informada'}
PRODUTO/SERVIÇO: ${planningData.mainProducts || 'Não informado'}
PÚBLICO-ALVO: ${planningData.targetAudience || 'Não informado'}
TICKET MÉDIO: ${planningData.averageTicket || 'Não informado'}

OBJETIVO PRINCIPAL: ${planningData.primaryGoal || 'Não informado'}
TIPO DE SOLUÇÃO ESCOLHIDA: ${planningData.solutionType || 'Não informado'}
PROBLEMA PRINCIPAL RELATADO: ${planningData.mainProblem || 'Não informado'}

SOLUÇÃO PRIORITÁRIA DETERMINADA: ${prioritySolution}
SOLUÇÕES COMPLEMENTARES SUGERIDAS: ${complementarySolutions.join(', ') || 'Nenhuma'}

Gere o diagnóstico final em formato JSON.`;

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Muitas requisições. Aguarde um momento e tente novamente.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Créditos insuficientes. Adicione créditos para continuar.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Tentar parsear como JSON
    let diagnosis = {
      diagnosticoFinal: '',
      problemaCentral: '',
      proximoPasso: '',
    };

    try {
      // Remover possíveis marcadores de código
      const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      diagnosis = JSON.parse(cleanContent);
    } catch {
      // Se falhar o parse, usar o texto como diagnóstico
      diagnosis.diagnosticoFinal = rawContent;
      diagnosis.problemaCentral = 'Análise detalhada necessária para identificar o gargalo principal.';
      diagnosis.proximoPasso = 'O próximo passo é materializar a solução recomendada para apresentar ao cliente.';
    }

    // Montar resposta completa
    const result = {
      summary: diagnosis.diagnosticoFinal || rawContent,
      diagnosis: {
        diagnosticoFinal: diagnosis.diagnosticoFinal || rawContent,
        problemaCentral: diagnosis.problemaCentral || 'Necessário aprofundar análise do gargalo principal.',
        solucaoPrioritaria: prioritySolution,
        solucoesComplementares: complementarySolutions,
        proximoPasso: diagnosis.proximoPasso || 'O próximo passo é materializar a solução recomendada.',
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in nexia-simple-summary:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro ao gerar resumo' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
