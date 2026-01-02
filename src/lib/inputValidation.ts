/**
 * Validates input text to prevent garbage/random data
 * Returns { valid: boolean, error?: string }
 */

export function validateBusinessInput(text: string, fieldName: string, minLength = 10): { valid: boolean; error?: string } {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  
  if (!trimmed) {
    return { valid: false, error: `${fieldName} é obrigatório.` };
  }

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} deve ter pelo menos ${minLength} caracteres.` };
  }

  // Check for repeated characters (e.g., "aaaa", "wdwdwd")
  const repeatedCharPattern = /(.)\1{4,}/i;
  if (repeatedCharPattern.test(trimmed)) {
    return { valid: false, error: `Preencha ${fieldName.toLowerCase()} com informações reais do negócio.` };
  }

  // Check for repeated two-letter patterns (e.g., "wdwdwd", "asasas")
  const repeatedPatternRegex = /(.{1,2})\1{3,}/i;
  if (repeatedPatternRegex.test(trimmed.replace(/\s/g, ''))) {
    return { valid: false, error: `Preencha ${fieldName.toLowerCase()} com informações reais do negócio.` };
  }

  // Check character diversity - at least 5 unique characters
  const uniqueChars = new Set(trimmed.toLowerCase().replace(/\s/g, ''));
  if (uniqueChars.size < 5) {
    return { valid: false, error: `${fieldName} precisa de mais diversidade de informação.` };
  }

  // Check if text has at least 2 words
  const words = trimmed.split(' ').filter(w => w.length > 1);
  if (words.length < 2) {
    return { valid: false, error: `${fieldName} deve conter pelo menos duas palavras.` };
  }

  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', '1234', 'abcd'];
  const lowerText = trimmed.toLowerCase();
  for (const pattern of keyboardPatterns) {
    if (lowerText.includes(pattern)) {
      return { valid: false, error: `Preencha ${fieldName.toLowerCase()} com informações reais do negócio.` };
    }
  }

  return { valid: true };
}

export function validateShortInput(text: string, fieldName: string, minLength = 3): { valid: boolean; error?: string } {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  
  if (!trimmed) {
    return { valid: false, error: `${fieldName} é obrigatório.` };
  }

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} deve ter pelo menos ${minLength} caracteres.` };
  }

  // Check for repeated characters
  const repeatedCharPattern = /(.)\1{3,}/i;
  if (repeatedCharPattern.test(trimmed)) {
    return { valid: false, error: `Preencha ${fieldName.toLowerCase()} com informações reais.` };
  }

  return { valid: true };
}

export function sanitizeInput(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}
