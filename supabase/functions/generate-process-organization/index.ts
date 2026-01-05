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
  return `generate-process-organization_${hash}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationData, forceRegenerate } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Check cache
    const cacheKey = getCacheKey(organizationData);
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached process organization');
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Generating process organization for:', organizationData.businessType);

    const prompt = `Você é um consultor de processos para PMEs brasileiras.

NEGÓCIO: ${organizationData.businessType}
EQUIPE: ${organizationData.teamSize}
CANAIS: ${organizationData.contactChannels}
ONDE PERDE TEMPO: ${organizationData.timeWasteAreas}
PROBLEMA INTERNO: ${organizationData.mainInternalProblem}
OBJETIVO: ${organizationData.organizationGoal}

Gere organização de processos usando separadores ###:

###VISAO_GERAL###
3-4 parágrafos sobre operação ideal.

###PROBLEMAS_PROCESSO###
Problemas identificados e soluções.

###FLUXO_IDEAL###
Fluxo de atendimento do contato à entrega.

###ORGANIZACAO_INTERNA###
Quem faz o quê na equipe.

###ROTINA_DIARIA###
Manhã/Durante/Final do expediente.

###ROTINA_SEMANAL###
Início/Meio/Final da semana.

###PONTOS_ATENCAO###
Recomendações finais.

REGRAS: Texto corrido profissional, sem JSON, sem bullets, sem markdown.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 3000, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content returned from AI');
    }

    const parseSection = (text: string, sectionName: string): string => {
      const regex = new RegExp(`###${sectionName}###([\\s\\S]*?)(?=###|$)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim()
          .replace(/^\*\*.*?\*\*\s*/gm, '')
          .replace(/^\*\s*/gm, '')
          .replace(/^-\s*/gm, '')
          .replace(/\[|\]|\{|\}/g, '')
          .trim();
      }
      return '';
    };

    const result = {
      operationOverview: parseSection(content, 'VISAO_GERAL') || 'Conteúdo em processamento.',
      processProblems: parseSection(content, 'PROBLEMAS_PROCESSO') || 'Conteúdo em processamento.',
      idealFlow: parseSection(content, 'FLUXO_IDEAL') || 'Conteúdo em processamento.',
      internalOrganization: parseSection(content, 'ORGANIZACAO_INTERNA') || 'Conteúdo em processamento.',
      recommendedRoutine: (parseSection(content, 'ROTINA_DIARIA') + '\n\n' + parseSection(content, 'ROTINA_SEMANAL')).trim() || 'Conteúdo em processamento.',
      attentionPoints: parseSection(content, 'PONTOS_ATENCAO') || 'Conteúdo em processamento.'
    };

    // Cache result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    console.log('Process organization generated successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('Error in generate-process-organization:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar organização';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
