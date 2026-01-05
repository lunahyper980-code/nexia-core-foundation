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

    // NO AI - Just return the original message with a link to Google Translate
    // The frontend will handle opening the external translator
    
    console.log('Translation requested to:', targetLanguageLabel);
    console.log('Returning original message - user should use external translator');

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    const translateUrl = `https://translate.google.com/?sl=pt&tl=${targetLanguage}&text=${encodedMessage}`;

    return new Response(
      JSON.stringify({ 
        translatedMessage: message, // Return original - UI will guide user to translate externally
        originalLanguage: 'pt-BR',
        targetLanguage,
        targetLanguageLabel,
        translateUrl, // URL for external translation
        useExternalTranslator: true // Flag to indicate external translation needed
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
