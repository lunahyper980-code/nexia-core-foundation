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

    console.log(`Generating message for lead: ${lead.nome}, location: ${lead.localizacao}, language: ${language}`);

    // Build system prompt with language adaptation
    const systemPrompt = `You are a specialist in commercial communication for local businesses.

Your task is to generate ONE professional prospecting message ready to be sent via WhatsApp.

CRITICAL RULES:
1. HUMAN tone, polite and direct - don't be a pushy salesperson
2. Maximum 3-4 short sentences
3. NO excessive emojis (maximum 1-2 subtle if needed)
4. DO NOT promise specific things
5. Focus on sparking curiosity, not selling directly
6. Mention something specific about the lead's segment
7. End with a simple open question

LANGUAGE REQUIREMENT:
- Write the message ENTIRELY in ${language}
- Use natural expressions and idioms appropriate for ${language} speakers
${isBrazilian ? '- Use informal "você" and Brazilian Portuguese expressions' : ''}
${languageCode === 'pt-PT' ? '- Use formal Portuguese from Portugal expressions' : ''}
${languageCode.startsWith('es') ? '- Use appropriate Spanish for the region' : ''}

Respond ONLY with the message, no explanations or quotes.`;

    const userPrompt = `Generate a prospecting message for:

Business: ${lead.nome}
Segment: ${lead.segmento}
City/Location: ${lead.localizacao}
${lead.temSite ? 'Has website' : 'Does not have website'}
${lead.temInstagram ? 'Has Instagram' : ''}

The message should be as if you are offering website/app creation or digital marketing services.

IMPORTANT: The message MUST be written in ${language} because the lead is located in ${lead.localizacao}.`;

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
    const message = data.choices?.[0]?.message?.content?.trim() || '';

    console.log("Generated message:", message);

    return new Response(JSON.stringify({ message, language, languageCode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-lead-message:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
