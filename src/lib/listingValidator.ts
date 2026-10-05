export interface CreateListingInput {
  priceArs: number;
  notes?: string;
  description?: string;
  isSpecialCard?: boolean;
}

export interface ListingValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedNotes?: string;
}

export function validateListingInput(
  input: CreateListingInput,
  marketMedianArs: number
): ListingValidationResult {
  const errors: string[] = [];

  if (marketMedianArs > 0) {
    const minPrice = marketMedianArs * 0.15;
    const maxPrice = marketMedianArs * 6.0;

    if (input.priceArs < minPrice) {
      errors.push('El precio es absurdamente bajo (menor al 15% de la mediana).');
    }

    if (input.priceArs > maxPrice && !input.isSpecialCard) {
      errors.push('El precio es absurdamente alto (mayor al 600% de la mediana) sin flag de carta especial.');
    }
  }

  let originalText = input.notes || input.description || '';
  let sanitizedNotes = originalText;

  if (sanitizedNotes) {
    // 1. Emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    sanitizedNotes = sanitizedNotes.replace(emailRegex, '[BLOQUEADO]');

    // 2. URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
    sanitizedNotes = sanitizedNotes.replace(urlRegex, '[BLOQUEADO]');

    // Optional: detect things like mercado libre links without http
    const mlRegex = /articulo\.mercadolibre\.com\.ar[^\s]*/gi;
    sanitizedNotes = sanitizedNotes.replace(mlRegex, '[BLOQUEADO]');

    // 3. Phone numbers (very permissive to block evasions)
    // Looking for strings that have 8 to 15 digits, optionally separated by spaces, dashes, or dots.
    // E.g., +54 9 11 1234-5678, 1144445555, 11-4444-5555
    // Adjusted regex to try to not capture trailing spaces aggressively
    const phoneRegex = /(?:\+?\d{1,3}[\s-.]?)?(?:\(?\d{2,4}\)?[\s-.]?)?\d(?:[\s-.]?\d){7,11}/g;

    // Run phone regex
    sanitizedNotes = sanitizedNotes.replace(phoneRegex, (match) => {
      // If it looks like a simple price or quantity, we might want to spare it,
      // but usually prices are less than 8 digits (1,000,000 = 7 digits).
      // If it has 8 or more digits, it's blocked.
      const digitCount = match.replace(/\D/g, '').length;
      if (digitCount >= 8 && digitCount <= 15) {
        return '[BLOQUEADO]';
      }
      return match;
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedNotes: sanitizedNotes || undefined,
  };
}
