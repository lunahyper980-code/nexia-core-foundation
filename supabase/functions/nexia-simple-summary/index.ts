import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Simple cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCacheKey(payload: any): string {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return `nexia-simple-summary_${hash}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { planningData, forceRegenerate } = await req.json();

    // Check cache
    const cacheKey = getCacheKey(planningData);
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached summary');
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Determine priority solution
    const determinePrioritySolution = () => {
      const solutionType = planningData.solutionType || '';
      const primaryGoal = planningData.primaryGoal || '';
      
      const solutionMap: Record<string, string> = {
        'app': 'Aplicativo Mobile/PWA',
        'site': 'Site Profissional',
        'landing_page': 'Landing Page de Conversão',
      };

      if (solutionType && solutionMap[solutionType]) {
        return solutionMap[solutionType];
      }

      if (primaryGoal.includes('vender') || primaryGoal.includes('captar')) {
        return 'Landing Page de Conversão';
      }
      if (primaryGoal.includes('organizar') || primaryGoal.includes('automatizar')) {
        return 'Aplicativo Mobile/PWA';
      }
      return 'Site Profissional';
    };

    const determineComplementarySolutions = () => {
      const solutions: string[] = [];
      const primaryGoal = planningData.primaryGoal || '';
      const mainProblem = planningData.mainProblem || '';

      if (primaryGoal.includes('presenca') || mainProblem.includes('profissional')) {
        solutions.push('Autoridade e Reconhecimento Digital');
      }
      if (primaryGoal.includes('organizar') || mainProblem.includes('processo')) {
        solutions.push('Organização de Processos');
      }
      if (!mainProblem.includes('marca') && !mainProblem.includes('logo')) {
        solutions.push('Kit de Lançamento Digital');
      }
      if (primaryGoal.includes('captar')) {
        solutions.push('Posicionamento Digital');
      }

      return [...new Set(solutions)].slice(0, 3);
    };

    const prioritySolution = determinePrioritySolution();
    const complementarySolutions = determineComplementarySolutions();

    const prompt = `Você é um consultor de negócios digitais. Analise o briefing e gere diagnóstico final.

EMPRESA: ${planningData.companyName || 'Não informado'}
NICHO: ${planningData.sectorNiche || 'Não informado'}
LOCAL: ${planningData.location || 'Não informada'}
PRODUTO: ${planningData.mainProducts || 'Não informado'}
PÚBLICO: ${planningData.targetAudience || 'Não informado'}
OBJETIVO: ${planningData.primaryGoal || 'Não informado'}
TIPO SOLUÇÃO: ${planningData.solutionType || 'Não informado'}
PROBLEMA: ${planningData.mainProblem || 'Não informado'}
SOLUÇÃO PRIORITÁRIA: ${prioritySolution}
COMPLEMENTARES: ${complementarySolutions.join(', ') || 'Nenhuma'}

Retorne JSON:
{
  "diagnosticoFinal": "Veredito em 2-3 frases",
  "problemaCentral": "Frase objetiva do gargalo",
  "proximoPasso": "Instrução clara de ação"
}`;

    console.log('Generating summary for:', planningData.companyName);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Muitas requisições. Aguarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let diagnosis = {
      diagnosticoFinal: '',
      problemaCentral: '',
      proximoPasso: '',
    };

    try {
      const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      diagnosis = JSON.parse(cleanContent);
    } catch {
      diagnosis.diagnosticoFinal = rawContent;
      diagnosis.problemaCentral = 'Análise detalhada necessária.';
      diagnosis.proximoPasso = 'Materializar a solução recomendada.';
    }

    const result = {
      summary: diagnosis.diagnosticoFinal || rawContent,
      diagnosis: {
        diagnosticoFinal: diagnosis.diagnosticoFinal || rawContent,
        problemaCentral: diagnosis.problemaCentral || 'Necessário aprofundar análise.',
        solucaoPrioritaria: prioritySolution,
        solucoesComplementares: complementarySolutions,
        proximoPasso: diagnosis.proximoPasso || 'Materializar a solução recomendada.',
      }
    };

    // Cache result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

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
