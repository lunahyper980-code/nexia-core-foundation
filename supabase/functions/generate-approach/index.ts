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
  return `generate-approach_${hash}`;
}

// Map country to language
function getLanguageForLocation(location: string): { language: string; languageCode: string } {
  const locationLower = location?.toLowerCase() || '';
  
  if (locationLower.includes('brasil') || locationLower.includes('brazil') || 
      locationLower.includes('br') || locationLower.includes('são paulo') || 
      locationLower.includes('rio de janeiro')) {
    return { language: 'Português Brasileiro', languageCode: 'pt-BR' };
  }
  
  if (locationLower.includes('portugal') || locationLower.includes('lisboa')) {
    return { language: 'Português de Portugal', languageCode: 'pt-PT' };
  }
  
  if (locationLower.includes('españa') || locationLower.includes('spain') || 
      locationLower.includes('madrid')) {
    return { language: 'Español', languageCode: 'es-ES' };
  }
  
  if (locationLower.includes('méxico') || locationLower.includes('argentina') ||
      locationLower.includes('colombia') || locationLower.includes('chile')) {
    return { language: 'Español Latinoamericano', languageCode: 'es-419' };
  }
  
  if (locationLower.includes('usa') || locationLower.includes('united states') ||
      locationLower.includes('new york')) {
    return { language: 'English (US)', languageCode: 'en-US' };
  }
  
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') ||
      locationLower.includes('london')) {
    return { language: 'English (UK)', languageCode: 'en-GB' };
  }
  
  return { language: 'English', languageCode: 'en-US' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead, forceRegenerate } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Check cache
    const cacheKey = getCacheKey(lead);
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached approach');
        return new Response(JSON.stringify({ approach: cached.data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { language, languageCode } = getLanguageForLocation(lead.localizacao);
    const isBrazilian = languageCode === 'pt-BR';

    console.log(`Generating approach for lead: ${lead.nome}, language: ${language}`);

    const prompt = `Você é um especialista em vendas consultivas para negócios locais.

Crie uma ESTRATÉGIA DE ABORDAGEM completa para primeiro contato.

PRINCÍPIOS:
1. NÃO VENDA no primeiro contato
2. Crie CONEXÃO e CURIOSIDADE
3. Seja HUMANO, não vendedor
4. Faça PERGUNTAS, não ofertas

IDIOMA:
- Mensagens para o cliente: em ${language}
- Notas estratégicas (objetivo, naoFalar, falar): em Português

LEAD:
Negócio: ${lead.nome}
Segmento: ${lead.segmento}
Local: ${lead.localizacao}
${lead.temSite ? 'Tem site' : 'Não tem site'}
${lead.temInstagram ? 'Tem Instagram' : ''}

Retorne JSON:
{
  "whatsapp": {
    "objetivo": "objetivo em português",
    "mensagens": ["msg1 em ${language}", "msg2 em ${language}", "msg3 em ${language}"]
  },
  "instagram": {
    "objetivo": "objetivo em português",
    "mensagens": ["msg1 em ${language}", "msg2 em ${language}", "msg3 em ${language}"]
  },
  "email": {
    "objetivo": "objetivo em português",
    "mensagens": ["assunto: Assunto em ${language} | corpo: Mensagem em ${language}"]
  },
  "ligacao": {
    "objetivo": "objetivo em português",
    "roteiro": ["passo1 em português", "passo2", "passo3", "passo4"]
  },
  "continuacao": {
    "introducao": "texto em português sobre como continuar",
    "respostas": ["resposta1 em ${language}", "resposta2", "resposta3"]
  },
  "objecoes": [
    {
      "objecao": "Objeção em ${language}",
      "resposta": "resposta em ${language}",
      "naoFalar": "orientação em português",
      "falar": "orientação em português"
    }
  ],
  "fechamento": {
    "sinais": ["sinal1 em português", "sinal2", "sinal3"],
    "transicao": "frase de transição em ${language}"
  }
}

REGRAS:
- Máximo 4 frases por mensagem
- Sem emojis excessivos (máximo 1 sutil)
- Linguagem natural para ${language}
${isBrazilian ? '- Use "você" informal e expressões brasileiras' : ''}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error('Erro ao comunicar com IA');
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    let approach;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      approach = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing approach JSON:', parseError);
      approach = getDefaultMessages(lead, language, languageCode);
    }

    approach.language = language;
    approach.languageCode = languageCode;

    // Cache result
    cache.set(cacheKey, { data: approach, timestamp: Date.now() });

    return new Response(JSON.stringify({ approach }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-approach:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getDefaultMessages(lead: any, language: string, languageCode: string) {
  if (languageCode === 'pt-BR') {
    return {
      whatsapp: {
        objetivo: "Iniciar conversa de forma natural",
        mensagens: [
          `Oi, tudo bem? Vi o perfil da ${lead.nome} e achei interessante o trabalho de vocês. Como está o movimento?`,
          `Olá! Trabalho com presença digital e estava pesquisando negócios de ${lead.segmento}. Posso fazer uma pergunta rápida?`,
          `E aí, tudo certo? Percebi que vocês trabalham com ${lead.segmento}. Já pensaram em fortalecer a presença online?`
        ]
      },
      instagram: {
        objetivo: "Engajar antes de abordar",
        mensagens: [
          `Curti demais o trabalho de vocês! Quanto tempo de mercado?`,
          `Que legal o perfil! Vocês trabalham mais com qual público?`,
          `Parabéns pelo trabalho! Como está sendo a experiência no digital?`
        ]
      },
      email: {
        objetivo: "Abordagem formal e consultiva",
        mensagens: [
          `assunto: Sobre o segmento de ${lead.segmento} | corpo: Olá! Meu nome é [seu nome] e trabalho ajudando negócios locais a crescerem no digital. Posso compartilhar algumas ideias?`
        ]
      },
      ligacao: {
        objetivo: "Conexão rápida por voz",
        roteiro: [
          "Apresente-se brevemente",
          "Mencione que pesquisou sobre o negócio",
          "Faça uma pergunta sobre o momento atual",
          "Proponha conversa sem compromisso"
        ]
      },
      continuacao: {
        introducao: "Continue com curiosidade genuína sobre o negócio.",
        respostas: [
          "Legal, faz sentido. E como vocês lidam com [aspecto]?",
          "Entendi. Isso costuma impactar em quê no dia a dia?",
          "Interessante. Posso te mostrar algo que vi em negócios parecidos?"
        ]
      },
      objecoes: [
        {
          objecao: "Agora não tenho tempo",
          resposta: "Entendo perfeitamente. Posso te mandar mensagem em outro momento?",
          naoFalar: "Não insista",
          falar: "Respeite e deixe porta aberta"
        }
      ],
      fechamento: {
        sinais: ["Faz perguntas sobre como funciona", "Pede preço ou prazo", "Menciona problemas específicos"],
        transicao: "Com base no que você me contou, faz sentido te mostrar uma proposta?"
      }
    };
  }
  
  // English default
  return {
    whatsapp: {
      objetivo: "Start natural conversation",
      mensagens: [
        `Hi! I came across ${lead.nome} and was impressed by your work. How's business going?`,
        `Hello! I work with digital presence and was researching ${lead.segmento} businesses. Mind if I ask a quick question?`,
        `Hey! I noticed you work with ${lead.segmento}. Have you considered strengthening your online presence?`
      ]
    },
    instagram: {
      objetivo: "Engage before approaching",
      mensagens: [
        `Love what you're doing! How long have you been in business?`,
        `Great profile! What's your main target audience?`,
        `Impressive work! How's your experience been in the digital space?`
      ]
    },
    email: {
      objetivo: "Formal consultative approach",
      mensagens: [
        `assunto: About the ${lead.segmento} industry | corpo: Hi! My name is [your name] and I help local businesses grow digitally. Would you like me to share some ideas?`
      ]
    },
    ligacao: {
      objetivo: "Quick voice connection",
      roteiro: [
        "Introduce yourself briefly",
        "Mention you researched the business",
        "Ask about current situation",
        "Propose a no-commitment chat"
      ]
    },
    continuacao: {
      introducao: "Continue with genuine curiosity about the business.",
      respostas: [
        "That makes sense. How do you currently handle [aspect]?",
        "I see. How does that usually impact your day-to-day?",
        "Interesting. Would you like to see something I've noticed works for similar businesses?"
      ]
    },
    objecoes: [
      {
        objecao: "I don't have time right now",
        resposta: "I completely understand. Would it be okay if I reached out at a better time?",
        naoFalar: "Don't insist",
        falar: "Respect and leave door open"
      }
    ],
    fechamento: {
      sinais: ["Asks how it works", "Asks about price or timeline", "Mentions specific problems"],
      transicao: "Based on what you've told me, would it make sense to show you a proposal?"
    }
  };
}
