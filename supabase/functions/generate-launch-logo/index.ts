import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandName, brandStyle, brandFeeling, preferredColors, visualNotes } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // NOTE: Logo generation only happens when user clicks "Gerar Logo (Beta)"
    // This function only generates TEXT identity - no image generation

    const prompt = `Você é um especialista em branding e identidade visual.

MARCA: ${brandName}
ESTILO: ${brandStyle}
SENSAÇÃO: ${brandFeeling}
${preferredColors ? `CORES: ${preferredColors}` : ''}
${visualNotes ? `OBS: ${visualNotes}` : ''}

IMPORTANTE: Você NÃO gera imagem. Apenas textos estratégicos.

Retorne JSON válido:
{
  "descricao_identidade": "2-3 parágrafos sobre identidade visual, personalidade, sensações, formas e elementos",
  "paleta_cores": "3-5 cores em hex com significado. Ex: Azul Navy (#1E3A5F) - transmite confiança...",
  "tipografia_sugerida": "Sugestão de fontes para títulos e corpo com justificativa",
  "prompt_logo": "Prompt em INGLÊS para gerar logo em IA (DALL-E, Midjourney). Inclua: clean modern minimalist logo design, vector style, centered, white background, cores e elementos específicos"
}`;

    console.log('Generating brand identity for:', brandName);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let conceptResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        conceptResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      conceptResult = { 
        descricao_identidade: `Identidade visual ${brandStyle} para ${brandName}, transmitindo ${brandFeeling}.`,
        paleta_cores: preferredColors || 'Cores a definir.',
        tipografia_sugerida: 'Fonte sans-serif moderna para títulos e fonte legível para textos.',
        prompt_logo: `Modern minimalist logo for ${brandName}, ${brandStyle} style, ${brandFeeling} feeling, clean vector design, centered, white background`
      };
    }

    console.log('Brand identity generated for:', brandName);

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
