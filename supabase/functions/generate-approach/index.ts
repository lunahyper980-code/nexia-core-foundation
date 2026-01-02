import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map country to language for outbound messages
function getLanguageForLocation(location: string): { language: string; languageCode: string } {
  const locationLower = location?.toLowerCase() || '';
  
  // Brazil - Portuguese (Brazil)
  if (locationLower.includes('brasil') || locationLower.includes('brazil') || 
      locationLower.includes('br') || locationLower.includes('são paulo') || 
      locationLower.includes('rio de janeiro') || locationLower.includes('belo horizonte') ||
      locationLower.includes('curitiba') || locationLower.includes('salvador') ||
      locationLower.includes('fortaleza') || locationLower.includes('brasília')) {
    return { language: 'Português Brasileiro', languageCode: 'pt-BR' };
  }
  
  // Portugal - Portuguese (Portugal)
  if (locationLower.includes('portugal') || locationLower.includes('lisboa') || 
      locationLower.includes('porto') || locationLower.includes('pt')) {
    return { language: 'Português de Portugal', languageCode: 'pt-PT' };
  }
  
  // Spain - Spanish
  if (locationLower.includes('españa') || locationLower.includes('spain') || 
      locationLower.includes('madrid') || locationLower.includes('barcelona') ||
      locationLower.includes('es')) {
    return { language: 'Español', languageCode: 'es-ES' };
  }
  
  // Latin America Spanish-speaking countries
  if (locationLower.includes('méxico') || locationLower.includes('mexico') ||
      locationLower.includes('argentina') || locationLower.includes('buenos aires') ||
      locationLower.includes('colombia') || locationLower.includes('bogotá') ||
      locationLower.includes('chile') || locationLower.includes('santiago') ||
      locationLower.includes('peru') || locationLower.includes('lima') ||
      locationLower.includes('venezuela') || locationLower.includes('ecuador') ||
      locationLower.includes('uruguay') || locationLower.includes('paraguay')) {
    return { language: 'Español Latinoamericano', languageCode: 'es-419' };
  }
  
  // France - French
  if (locationLower.includes('france') || locationLower.includes('francia') ||
      locationLower.includes('paris') || locationLower.includes('lyon') ||
      locationLower.includes('fr')) {
    return { language: 'Français', languageCode: 'fr-FR' };
  }
  
  // Germany - German
  if (locationLower.includes('germany') || locationLower.includes('alemania') ||
      locationLower.includes('deutschland') || locationLower.includes('berlin') ||
      locationLower.includes('münchen') || locationLower.includes('de')) {
    return { language: 'Deutsch', languageCode: 'de-DE' };
  }
  
  // Italy - Italian
  if (locationLower.includes('italy') || locationLower.includes('italia') ||
      locationLower.includes('roma') || locationLower.includes('milano') ||
      locationLower.includes('it')) {
    return { language: 'Italiano', languageCode: 'it-IT' };
  }
  
  // UK - English
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') ||
      locationLower.includes('england') || locationLower.includes('london') ||
      locationLower.includes('manchester') || locationLower.includes('reino unido')) {
    return { language: 'English (UK)', languageCode: 'en-GB' };
  }
  
  // USA - English
  if (locationLower.includes('usa') || locationLower.includes('united states') ||
      locationLower.includes('estados unidos') || locationLower.includes('new york') ||
      locationLower.includes('los angeles') || locationLower.includes('chicago') ||
      locationLower.includes('miami') || locationLower.includes('us')) {
    return { language: 'English (US)', languageCode: 'en-US' };
  }
  
  // Canada - Could be English or French, default to English
  if (locationLower.includes('canada') || locationLower.includes('toronto') ||
      locationLower.includes('vancouver')) {
    return { language: 'English', languageCode: 'en-CA' };
  }
  
  // Japan - Japanese
  if (locationLower.includes('japan') || locationLower.includes('japão') ||
      locationLower.includes('tokyo') || locationLower.includes('osaka') ||
      locationLower.includes('jp')) {
    return { language: 'Japanese', languageCode: 'ja-JP' };
  }
  
  // China - Chinese
  if (locationLower.includes('china') || locationLower.includes('beijing') ||
      locationLower.includes('shanghai') || locationLower.includes('cn')) {
    return { language: 'Simplified Chinese', languageCode: 'zh-CN' };
  }
  
  // Default to English for unidentified locations
  return { language: 'English', languageCode: 'en-US' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Detect language based on lead location
    const { language, languageCode } = getLanguageForLocation(lead.localizacao);
    const isBrazilian = languageCode === 'pt-BR';

    console.log(`Generating approach strategy for lead: ${lead.nome}, location: ${lead.localizacao}, language: ${language}`);

    // System prompt instructs AI to generate messages in the detected language
    // but keeps strategy explanations in Portuguese for the user
    const systemPrompt = `You are a specialist in consultative sales and commercial communication for local businesses.

Your task is to generate a COMPLETE APPROACH STRATEGY for first contact with a potential client.

FUNDAMENTAL PRINCIPLES:
1. DO NOT SELL on first contact
2. Create CONNECTION and CURIOSITY
3. Be HUMAN, not a salesperson
4. Ask QUESTIONS, not offers
5. Natural and polite tone

CRITICAL LANGUAGE REQUIREMENT:
- ALL messages to be sent to the client (WhatsApp, Instagram, Email, objection responses, continuation messages, closing phrases) MUST be written in ${language}
- The "objetivo" (objective), "introducao" (introduction), "naoFalar" (what not to say), and "falar" (what to say) fields are INTERNAL STRATEGY NOTES for the user - keep these in Portuguese (Brazil)
- The "roteiro" (script) for phone calls is also internal guidance - keep in Portuguese
- Only the actual TEXT that will be SENT or SPOKEN to the client should be in ${language}

Respond MANDATORILY in JSON format with the following structure:
{
  "whatsapp": {
    "objetivo": "objetivo em português para o usuário",
    "mensagens": ["mensagem1 em ${language}", "mensagem2 em ${language}", "mensagem3 em ${language}"]
  },
  "instagram": {
    "objetivo": "objetivo em português para o usuário",
    "mensagens": ["mensagem1 em ${language}", "mensagem2 em ${language}", "mensagem3 em ${language}"]
  },
  "email": {
    "objetivo": "objetivo em português para o usuário",
    "mensagens": ["assunto: Assunto em ${language} | corpo: Mensagem do email em ${language}"]
  },
  "ligacao": {
    "objetivo": "objetivo em português para o usuário",
    "roteiro": ["passo1 em português", "passo2 em português", "passo3 em português", "passo4 em português"]
  },
  "continuacao": {
    "introducao": "texto explicativo em português sobre como continuar a conversa",
    "respostas": ["resposta1 em ${language}", "resposta2 em ${language}", "resposta3 em ${language}"]
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
    "sinais": ["sinal1 em português", "sinal2 em português", "sinal3 em português"],
    "transicao": "frase de transição em ${language}"
  }
}

MESSAGE RULES:
- Maximum 4 sentences per message
- No excessive emojis (maximum 1 subtle)
- Natural language appropriate for ${language} speakers
- Focus on open questions
- Mention something specific about the segment
- No direct promises or offers
${isBrazilian ? '- Use informal "você" and Brazilian expressions for messages' : ''}
${languageCode === 'pt-PT' ? '- Use formal Portuguese from Portugal expressions for messages' : ''}`;

    const userPrompt = `Generate the complete approach strategy for:

Business: ${lead.nome}
Segment: ${lead.segmento}
Location: ${lead.localizacao}
${lead.temSite ? 'Has website' : 'Does not have website'}
${lead.temInstagram ? 'Has Instagram' : 'Does not have Instagram'}

Context: Website/app and digital marketing service provider approaching this potential client.

REMEMBER: All messages to be sent to the client must be in ${language} because the lead is located in ${lead.localizacao}.
Strategy notes and internal guidance should remain in Portuguese for the Nexia Suite user.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao comunicar com IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    console.log("Generated approach content:", content);

    // Parse JSON from response
    let approach;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      approach = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing approach JSON:", parseError);
      // Return a default structure if parsing fails - in the detected language
      const defaultMessages = getDefaultMessages(lead, language, languageCode);
      approach = defaultMessages;
    }

    // Add language metadata to response
    approach.language = language;
    approach.languageCode = languageCode;

    return new Response(JSON.stringify({ approach }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-approach:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Generate default messages based on language
function getDefaultMessages(lead: any, language: string, languageCode: string) {
  // Brazilian Portuguese defaults
  if (languageCode === 'pt-BR') {
    return {
      whatsapp: {
        objetivo: "Iniciar conversa de forma natural",
        mensagens: [
          `Oi, tudo bem? Vi o perfil da ${lead.nome} e achei interessante o trabalho de vocês com ${lead.segmento}. Como está o movimento por aí?`,
          `Olá! Trabalho com presença digital e estava pesquisando negócios de ${lead.segmento} em ${lead.localizacao}. Posso fazer uma pergunta rápida?`,
          `E aí, tudo certo? Percebi que vocês trabalham com ${lead.segmento}. Já pensaram em fortalecer a presença online do negócio?`
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
        objetivo: "Abordagem mais formal e consultiva",
        mensagens: [
          `assunto: Uma observação sobre o segmento de ${lead.segmento} | corpo: Olá! Meu nome é [seu nome] e trabalho ajudando negócios locais a crescerem no digital. Percebi que vocês atuam com ${lead.segmento} em ${lead.localizacao} e tenho algumas ideias que podem ser úteis. Posso compartilhar?`
        ]
      },
      ligacao: {
        objetivo: "Estabelecer conexão rápida por voz",
        roteiro: [
          "Apresente-se brevemente (nome e área de atuação)",
          "Mencione que pesquisou sobre o negócio",
          "Faça uma pergunta sobre o momento atual do negócio",
          "Proponha uma conversa breve sem compromisso"
        ]
      },
      continuacao: {
        introducao: "Quando o cliente responder, continue a conversa com curiosidade genuína. Faça perguntas abertas sobre o negócio e os desafios do dia a dia.",
        respostas: [
          "Legal, faz sentido. E como vocês lidam com [aspecto do negócio]?",
          "Entendi. Isso costuma impactar em quê no dia a dia?",
          "Interessante. Posso te mostrar algo que vi em negócios parecidos?"
        ]
      },
      objecoes: [
        {
          objecao: "Agora não tenho tempo",
          resposta: "Entendo perfeitamente. Posso te mandar uma mensagem em outro momento? Qual seria melhor?",
          naoFalar: "Não insista ou tente convencer que é rápido",
          falar: "Respeite o tempo e deixe a porta aberta"
        },
        {
          objecao: "Já tenho alguém que faz isso",
          resposta: "Ótimo! Ter suporte é importante. Estou disponível caso precisem de uma segunda opinião algum dia.",
          naoFalar: "Não critique o concorrente ou compare",
          falar: "Valide a escolha e se posicione como alternativa"
        },
        {
          objecao: "Não é prioridade agora",
          resposta: "Faz sentido. Cada momento tem suas prioridades. Posso entrar em contato em alguns meses?",
          naoFalar: "Não tente convencer que deveria ser prioridade",
          falar: "Aceite e programe um follow-up futuro"
        }
      ],
      fechamento: {
        sinais: [
          "Cliente começa a fazer perguntas sobre como funciona",
          "Pede informações de preço ou prazo",
          "Menciona problemas específicos que precisa resolver"
        ],
        transicao: "Com base no que você me contou, faz sentido te mostrar uma proposta que resolve exatamente isso. Posso preparar algo específico pro seu caso?"
      }
    };
  }
  
  // English defaults (US/UK/other)
  if (languageCode.startsWith('en')) {
    return {
      whatsapp: {
        objetivo: "Iniciar conversa de forma natural",
        mensagens: [
          `Hi! I came across ${lead.nome} and was impressed by your work in ${lead.segmento}. How's business going?`,
          `Hello! I work with digital presence and was researching ${lead.segmento} businesses in ${lead.localizacao}. Mind if I ask a quick question?`,
          `Hey there! I noticed you work with ${lead.segmento}. Have you considered strengthening your online presence?`
        ]
      },
      instagram: {
        objetivo: "Engajar antes de abordar",
        mensagens: [
          `Love what you're doing! How long have you been in business?`,
          `Great profile! What's your main target audience?`,
          `Impressive work! How's your experience been in the digital space?`
        ]
      },
      email: {
        objetivo: "Abordagem mais formal e consultiva",
        mensagens: [
          `assunto: A note about the ${lead.segmento} industry | corpo: Hi! My name is [your name] and I help local businesses grow digitally. I noticed you work with ${lead.segmento} in ${lead.localizacao} and I have some ideas that might be helpful. Would you like me to share them?`
        ]
      },
      ligacao: {
        objetivo: "Estabelecer conexão rápida por voz",
        roteiro: [
          "Apresente-se brevemente (nome e área de atuação)",
          "Mencione que pesquisou sobre o negócio",
          "Faça uma pergunta sobre o momento atual do negócio",
          "Proponha uma conversa breve sem compromisso"
        ]
      },
      continuacao: {
        introducao: "Quando o cliente responder, continue a conversa com curiosidade genuína. Faça perguntas abertas sobre o negócio e os desafios do dia a dia.",
        respostas: [
          "That makes sense. How do you currently handle [aspect of business]?",
          "I see. How does that usually impact your day-to-day operations?",
          "Interesting. Would you like to see something I've noticed works for similar businesses?"
        ]
      },
      objecoes: [
        {
          objecao: "I don't have time right now",
          resposta: "I completely understand. Would it be okay if I reached out at a better time? When works for you?",
          naoFalar: "Não insista ou tente convencer que é rápido",
          falar: "Respeite o tempo e deixe a porta aberta"
        },
        {
          objecao: "I already have someone for that",
          resposta: "That's great! Having support is important. I'm here if you ever need a second opinion.",
          naoFalar: "Não critique o concorrente ou compare",
          falar: "Valide a escolha e se posicione como alternativa"
        },
        {
          objecao: "It's not a priority right now",
          resposta: "That makes sense. Every moment has its priorities. May I follow up in a few months?",
          naoFalar: "Não tente convencer que deveria ser prioridade",
          falar: "Aceite e programe um follow-up futuro"
        }
      ],
      fechamento: {
        sinais: [
          "Cliente começa a fazer perguntas sobre como funciona",
          "Pede informações de preço ou prazo",
          "Menciona problemas específicos que precisa resolver"
        ],
        transicao: "Based on what you've shared, it makes sense to show you a proposal that addresses exactly this. Can I put together something specific for your case?"
      }
    };
  }
  
  // Spanish defaults
  if (languageCode.startsWith('es')) {
    return {
      whatsapp: {
        objetivo: "Iniciar conversa de forma natural",
        mensagens: [
          `¡Hola! Encontré el perfil de ${lead.nome} y me pareció muy interesante su trabajo en ${lead.segmento}. ¿Cómo va el negocio?`,
          `¡Hola! Trabajo con presencia digital y estaba investigando negocios de ${lead.segmento} en ${lead.localizacao}. ¿Puedo hacerte una pregunta rápida?`,
          `¡Hola! Noté que trabajan con ${lead.segmento}. ¿Han pensado en fortalecer su presencia online?`
        ]
      },
      instagram: {
        objetivo: "Engajar antes de abordar",
        mensagens: [
          `¡Me encanta lo que hacen! ¿Cuánto tiempo llevan en el mercado?`,
          `¡Qué buen perfil! ¿Cuál es su público principal?`,
          `¡Felicidades por el trabajo! ¿Cómo ha sido su experiencia en lo digital?`
        ]
      },
      email: {
        objetivo: "Abordagem mais formal e consultiva",
        mensagens: [
          `assunto: Una observación sobre el sector de ${lead.segmento} | corpo: ¡Hola! Mi nombre es [tu nombre] y ayudo a negocios locales a crecer digitalmente. Noté que trabajan con ${lead.segmento} en ${lead.localizacao} y tengo algunas ideas que podrían ser útiles. ¿Puedo compartirlas?`
        ]
      },
      ligacao: {
        objetivo: "Estabelecer conexão rápida por voz",
        roteiro: [
          "Apresente-se brevemente (nome e área de atuação)",
          "Mencione que pesquisou sobre o negócio",
          "Faça uma pergunta sobre o momento atual do negócio",
          "Proponha uma conversa breve sem compromisso"
        ]
      },
      continuacao: {
        introducao: "Quando o cliente responder, continue a conversa com curiosidade genuína. Faça perguntas abertas sobre o negócio e os desafios do dia a dia.",
        respostas: [
          "Tiene sentido. ¿Cómo manejan actualmente [aspecto del negocio]?",
          "Entiendo. ¿Cómo suele impactar eso en el día a día?",
          "Interesante. ¿Te gustaría ver algo que he notado en negocios similares?"
        ]
      },
      objecoes: [
        {
          objecao: "Ahora no tengo tiempo",
          resposta: "Lo entiendo perfectamente. ¿Puedo contactarte en otro momento? ¿Cuándo sería mejor?",
          naoFalar: "Não insista ou tente convencer que é rápido",
          falar: "Respeite o tempo e deixe a porta aberta"
        },
        {
          objecao: "Ya tengo a alguien que hace eso",
          resposta: "¡Excelente! Tener apoyo es importante. Estoy disponible si algún día necesitan una segunda opinión.",
          naoFalar: "Não critique o concorrente ou compare",
          falar: "Valide a escolha e se posicione como alternativa"
        },
        {
          objecao: "No es prioridad ahora",
          resposta: "Tiene sentido. Cada momento tiene sus prioridades. ¿Puedo contactarte en unos meses?",
          naoFalar: "Não tente convencer que deveria ser prioridade",
          falar: "Aceite e programe um follow-up futuro"
        }
      ],
      fechamento: {
        sinais: [
          "Cliente começa a fazer perguntas sobre como funciona",
          "Pede informações de preço ou prazo",
          "Menciona problemas específicos que precisa resolver"
        ],
        transicao: "Basándome en lo que me has contado, tiene sentido mostrarte una propuesta que resuelve exactamente esto. ¿Puedo preparar algo específico para tu caso?"
      }
    };
  }
  
  // Default fallback to English
  return {
    whatsapp: {
      objetivo: "Iniciar conversa de forma natural",
      mensagens: [
        `Hi! I came across ${lead.nome} and was impressed by your work in ${lead.segmento}. How's business going?`,
        `Hello! I work with digital presence and was researching ${lead.segmento} businesses. Mind if I ask a quick question?`,
        `Hey there! I noticed you work with ${lead.segmento}. Have you considered strengthening your online presence?`
      ]
    },
    instagram: {
      objetivo: "Engajar antes de abordar",
      mensagens: [
        `Love what you're doing! How long have you been in business?`,
        `Great profile! What's your main target audience?`,
        `Impressive work! How's your experience been in the digital space?`
      ]
    },
    email: {
      objetivo: "Abordagem mais formal e consultiva",
      mensagens: [
        `assunto: A note about the ${lead.segmento} industry | corpo: Hi! My name is [your name] and I help local businesses grow digitally. I noticed you work with ${lead.segmento} and I have some ideas that might be helpful. Would you like me to share them?`
      ]
    },
    ligacao: {
      objetivo: "Estabelecer conexão rápida por voz",
      roteiro: [
        "Apresente-se brevemente (nome e área de atuação)",
        "Mencione que pesquisou sobre o negócio",
        "Faça uma pergunta sobre o momento atual do negócio",
        "Proponha uma conversa breve sem compromisso"
      ]
    },
    continuacao: {
      introducao: "Quando o cliente responder, continue a conversa com curiosidade genuína. Faça perguntas abertas sobre o negócio e os desafios do dia a dia.",
      respostas: [
        "That makes sense. How do you currently handle that?",
        "I see. How does that usually impact your day-to-day?",
        "Interesting. Would you like to see what works for similar businesses?"
      ]
    },
    objecoes: [
      {
        objecao: "I don't have time right now",
        resposta: "I completely understand. Would it be okay if I reached out at a better time?",
        naoFalar: "Não insista ou tente convencer que é rápido",
        falar: "Respeite o tempo e deixe a porta aberta"
      },
      {
        objecao: "I already have someone for that",
        resposta: "That's great! I'm here if you ever need a second opinion.",
        naoFalar: "Não critique o concorrente ou compare",
        falar: "Valide a escolha e se posicione como alternativa"
      },
      {
        objecao: "It's not a priority right now",
        resposta: "That makes sense. May I follow up in a few months?",
        naoFalar: "Não tente convencer que deveria ser prioridade",
        falar: "Aceite e programe um follow-up futuro"
      }
    ],
    fechamento: {
      sinais: [
        "Cliente começa a fazer perguntas sobre como funciona",
        "Pede informações de preço ou prazo",
        "Menciona problemas específicos que precisa resolver"
      ],
      transicao: "Based on what you've shared, can I put together a proposal that addresses exactly this?"
    }
  };
}
