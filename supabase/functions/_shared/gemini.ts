// Shared Gemini API utilities for edge functions
// Uses GEMINI_API_KEY directly instead of Lovable AI Gateway

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
  error?: {
    message: string;
    code: number;
  };
}

// Simple in-memory cache with TTL (24 hours)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, { data: any; timestamp: number }>();

function generateCacheKey(userId: string, functionName: string, payload: any): string {
  const payloadStr = JSON.stringify(payload);
  // Simple hash function for the payload
  let hash = 0;
  for (let i = 0; i < payloadStr.length; i++) {
    const char = payloadStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `${userId}_${functionName}_${hash}`;
}

export function getCachedResponse(userId: string, functionName: string, payload: any): any | null {
  const key = generateCacheKey(userId, functionName, payload);
  const cached = cache.get(key);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    console.log(`Cache hit for ${functionName}`);
    return cached.data;
  }
  
  // Clean up expired entry
  if (cached) {
    cache.delete(key);
  }
  
  return null;
}

export function setCachedResponse(userId: string, functionName: string, payload: any, data: any): void {
  const key = generateCacheKey(userId, functionName, payload);
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`Cache set for ${functionName}`);
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number }
): Promise<{ content: string; error?: string }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured');
    return { content: '', error: 'GEMINI_API_KEY is not configured' };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          maxOutputTokens: options?.maxTokens || 2048,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return { content: '', error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' };
      }
      if (response.status === 403) {
        return { content: '', error: 'API Key inválida ou sem permissão.' };
      }
      
      return { content: '', error: `Erro na API Gemini: ${response.status}` };
    }

    const data: GeminiResponse = await response.json();
    
    if (data.error) {
      console.error('Gemini API returned error:', data.error);
      return { content: '', error: data.error.message };
    }
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!content) {
      return { content: '', error: 'Resposta vazia da IA' };
    }

    return { content };
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return { content: '', error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
