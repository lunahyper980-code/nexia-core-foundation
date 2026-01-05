import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandName, brandStyle, brandFeeling, preferredColors, visualNotes, secondaryText, generateImage = true } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Step 1: Generate text identity with Gemini
    const textPrompt = `Você é um especialista em branding e identidade visual.

MARCA: ${brandName}
${secondaryText ? `SLOGAN: ${secondaryText}` : ''}
ESTILO: ${brandStyle}
SENSAÇÃO: ${brandFeeling}
${preferredColors ? `CORES: ${preferredColors}` : ''}
${visualNotes ? `OBS: ${visualNotes}` : ''}

Retorne JSON válido:
{
  "descricao_identidade": "2-3 parágrafos sobre identidade visual, personalidade, sensações, formas e elementos",
  "paleta_cores": "3-5 cores em hex com significado. Ex: Azul Navy (#1E3A5F) - transmite confiança...",
  "tipografia_sugerida": "Sugestão de fontes para títulos e corpo com justificativa",
  "prompt_logo": "Prompt em INGLÊS para gerar logo. Inclua: clean modern minimalist logo design, vector style, centered, white background, cores e elementos específicos"
}`;

    console.log('Generating brand identity for:', brandName);

    const textResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: textPrompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error('Gemini API error:', textResponse.status, errorText);
      throw new Error(`Gemini API error: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const textContent = textData.candidates?.[0]?.content?.parts?.[0]?.text;

    let conceptResult;
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
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

    let logoImageUrl = null;

    // Step 2: Generate actual logo image with Lovable AI if requested and key available
    if (generateImage && LOVABLE_API_KEY) {
      try {
        const imagePrompt = `Create a professional, clean, modern logo for a brand called "${brandName}"${secondaryText ? ` with tagline "${secondaryText}"` : ''}.
Style: ${brandStyle}
Feeling: ${brandFeeling}
Colors: ${preferredColors || 'professional colors'}
${visualNotes ? `Additional notes: ${visualNotes}` : ''}

Requirements:
- Clean, minimalist vector-style logo
- Centered composition
- Pure white background (#FFFFFF)
- Professional business logo suitable for print and digital
- High contrast and legible
- Modern and memorable design
- Logo should work at small sizes
- No complex gradients, simple flat design preferred`;

        console.log('Generating logo image for:', brandName);

        const imageResponse = await fetch(LOVABLE_AI_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: imagePrompt
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (generatedImage) {
            logoImageUrl = generatedImage;
            console.log('Logo image generated successfully');
          } else {
            console.log('No image in response:', JSON.stringify(imageData).substring(0, 500));
          }
        } else {
          const errorText = await imageResponse.text();
          console.error('Logo image generation error:', imageResponse.status, errorText);
        }
      } catch (imageError) {
        console.error('Error generating logo image:', imageError);
        // Continue without image - text identity is still useful
      }
    }

    console.log('Brand identity completed for:', brandName, 'Logo generated:', !!logoImageUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        descricao_identidade: conceptResult.descricao_identidade,
        paleta_cores: conceptResult.paleta_cores,
        tipografia_sugerida: conceptResult.tipografia_sugerida,
        prompt_logo: conceptResult.prompt_logo,
        logo_url: logoImageUrl,
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
