import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Map country to language for outbound messages
function getLanguageForLocation(location: string): { language: string; languageCode: string } {
  const locationLower = location?.toLowerCase() || '';
  
  if (locationLower.includes('brasil') || locationLower.includes('brazil') || 
      locationLower.includes('br') || locationLower.includes('são paulo') || 
      locationLower.includes('rio de janeiro') || locationLower.includes('belo horizonte')) {
    return { language: 'Português Brasileiro', languageCode: 'pt-BR' };
  }
  
  if (locationLower.includes('portugal') || locationLower.includes('lisboa') || 
      locationLower.includes('porto')) {
    return { language: 'Português de Portugal', languageCode: 'pt-PT' };
  }
  
  if (locationLower.includes('españa') || locationLower.includes('spain') || 
      locationLower.includes('madrid') || locationLower.includes('barcelona')) {
    return { language: 'Español', languageCode: 'es-ES' };
  }
  
  if (locationLower.includes('méxico') || locationLower.includes('mexico') ||
      locationLower.includes('argentina') || locationLower.includes('colombia') ||
      locationLower.includes('chile') || locationLower.includes('peru')) {
    return { language: 'Español Latinoamericano', languageCode: 'es-419' };
  }
  
  if (locationLower.includes('usa') || locationLower.includes('united states') ||
      locationLower.includes('new york') || locationLower.includes('los angeles')) {
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
    const { lead } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { language, languageCode } = getLanguageForLocation(lead.localizacao);
    const isBrazilian = languageCode === 'pt-BR';

    console.log(`Generating message for lead: ${lead.nome}, language: ${language}`);

    const prompt = `Você é um especialista em comunicação comercial para negócios locais.

Gere UMA mensagem de prospecção profissional para WhatsApp.

REGRAS:
- Tom HUMANO, educado e direto
- Máximo 3-4 frases curtas
- NO máximo 1-2 emojis sutis
- NÃO prometa coisas específicas
- Foque em despertar curiosidade
- Mencione algo do segmento do lead
- Termine com pergunta aberta

IDIOMA: Escreva em ${language}
${isBrazilian ? '- Use "você" informal e expressões brasileiras' : ''}

LEAD:
Negócio: ${lead.nome}
Segmento: ${lead.segmento}
Local: ${lead.localizacao}
${lead.temSite ? 'Tem site' : 'Não tem site'}
${lead.temInstagram ? 'Tem Instagram' : ''}

Contexto: Você oferece serviços de criação de sites/apps e marketing digital.

Responda APENAS com a mensagem, sem explicações.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
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
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    console.log('Generated message:', message.substring(0, 50) + '...');

    return new Response(JSON.stringify({ message, language, languageCode }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-lead-message:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
