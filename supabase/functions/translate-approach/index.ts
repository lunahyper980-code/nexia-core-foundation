import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, targetLanguage, targetLanguageLabel } = await req.json();

    if (!message || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Message and target language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a professional translator specialized in commercial and business communication.

Your task is to translate sales approach messages while:
1. Preserving the commercial, professional and consultative tone
2. Maintaining the original objective of the message (first contact, continuation, handling objections, or closing)
3. Adapting expressions to sound natural in the target language
4. Keeping the message concise and direct
5. NOT translating proper nouns (company names, personal names)
6. Preserving any placeholders or variables in the text

IMPORTANT:
- Only translate the message content
- Do NOT add any explanations or notes
- Do NOT change the structure or intent of the message
- Make sure the translation sounds natural and professional in ${targetLanguageLabel}`;

    const userPrompt = `Translate the following sales approach message to ${targetLanguageLabel} (${targetLanguage}):

${message}

Provide ONLY the translated message, nothing else.`;

    console.log('Translating message to:', targetLanguageLabel);

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
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const translatedMessage = data.choices?.[0]?.message?.content?.trim();

    if (!translatedMessage) {
      throw new Error('No translation returned from AI');
    }

    console.log('Translation completed successfully');

    return new Response(
      JSON.stringify({ 
        translatedMessage,
        originalLanguage: 'pt-BR',
        targetLanguage,
        targetLanguageLabel
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
