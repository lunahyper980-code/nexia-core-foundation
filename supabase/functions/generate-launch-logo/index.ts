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
    const { brandName, brandStyle, brandFeeling, preferredColors, visualNotes } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Generate identity concept with AI - TEXT ONLY, NO IMAGE
    const conceptPrompt = `Você é um especialista em branding e identidade visual. Crie uma identidade de marca TEXTUAL para:

Nome da marca: ${brandName}
Estilo desejado: ${brandStyle}
Sensação da marca: ${brandFeeling}
${preferredColors ? `Cores preferidas: ${preferredColors}` : ''}
${visualNotes ? `Observações visuais: ${visualNotes}` : ''}

IMPORTANTE: Você NÃO vai gerar uma imagem. Você vai criar textos estratégicos sobre a identidade.

Responda APENAS em JSON válido com a estrutura:
{
  "descricao_identidade": "Descrição completa da identidade visual em 2-3 parágrafos. Inclua: estilo visual geral, personalidade da marca, sensações que a marca transmite, tipo de formas e elementos que combinam.",
  "paleta_cores": "Sugestão de paleta de cores com 3-5 cores em hexadecimal, explicando o significado de cada cor para a marca. Ex: Azul Navy (#1E3A5F) - transmite confiança...",
  "tipografia_sugerida": "Sugestão de fontes/tipografia que combinem com a marca. Inclua uma fonte para títulos e uma para corpo de texto, com justificativa.",
  "prompt_logo": "Prompt profissional em INGLÊS otimizado para gerar a logo em ferramentas de IA de imagem como DALL-E, Midjourney ou Canva AI. O prompt deve ser detalhado com estilo: clean modern minimalist logo design, vector style, centered, white background. Inclua cores, formas e elementos específicos."
}`;

    console.log('Generating brand identity for:', brandName);

    const conceptResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: conceptPrompt }
        ],
      }),
    });

    if (!conceptResponse.ok) {
      const errorText = await conceptResponse.text();
      console.error('AI Gateway error:', conceptResponse.status, errorText);
      throw new Error(`AI Gateway error: ${conceptResponse.status}`);
    }

    const conceptData = await conceptResponse.json();
    const conceptContent = conceptData.choices[0].message.content;

    let conceptResult;
    try {
      const jsonMatch = conceptContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        conceptResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in concept response');
      }
    } catch (parseError) {
      console.error('JSON parse error for concept:', parseError);
      conceptResult = { 
        descricao_identidade: `Identidade visual ${brandStyle} para ${brandName}, transmitindo ${brandFeeling}. A marca utiliza elementos visuais modernos e limpos, com foco em legibilidade e impacto visual.`,
        paleta_cores: preferredColors || 'Cores a definir baseadas no estilo escolhido.',
        tipografia_sugerida: 'Recomenda-se uma fonte sans-serif moderna para títulos e uma fonte legível para textos.',
        prompt_logo: `Modern minimalist logo for ${brandName}, ${brandStyle} style, ${brandFeeling} feeling, clean vector design, centered, white background, professional business logo`
      };
    }

    console.log('Brand identity generated successfully for:', brandName);

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        descricao_identidade: conceptResult.descricao_identidade,
        paleta_cores: conceptResult.paleta_cores,
        tipografia_sugerida: conceptResult.tipografia_sugerida,
        prompt_logo: conceptResult.prompt_logo,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating brand identity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
