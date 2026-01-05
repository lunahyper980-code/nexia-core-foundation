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
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Translating message to:', targetLanguageLabel || targetLanguage);

    const systemPrompt = `Você é um tradutor profissional especializado em comunicação comercial e mensagens de vendas. 
Sua tarefa é traduzir mensagens de abordagem comercial do português brasileiro para outros idiomas.

Regras importantes:
- Preserve o tom profissional, consultivo e persuasivo da mensagem original
- Mantenha a estrutura e formatação (quebras de linha, emojis se houver)
- Adapte expressões idiomáticas para soar natural no idioma de destino
- Mantenha nomes próprios, nomes de empresas e termos técnicos específicos
- NÃO adicione nenhum comentário ou explicação, apenas retorne a tradução`;

    const userPrompt = `Traduza a seguinte mensagem de abordagem comercial para ${targetLanguageLabel || targetLanguage}:

---
${message}
---

Retorne APENAS a mensagem traduzida, sem comentários adicionais.`;

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
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos na sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro no serviço de tradução' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const translatedMessage = data.choices?.[0]?.message?.content?.trim();

    if (!translatedMessage) {
      console.error('No translation in response:', data);
      return new Response(
        JSON.stringify({ error: 'Resposta vazia do serviço de tradução' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Translation successful');

    return new Response(
      JSON.stringify({ 
        translatedMessage,
        originalLanguage: 'pt-BR',
        targetLanguage,
        targetLanguageLabel,
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
