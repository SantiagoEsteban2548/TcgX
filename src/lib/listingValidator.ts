export interface CreateListingInput {
  priceArs: number;
  notes?: string;
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
  let sanitizedNotes = input.notes;
  let isValid = true;

  if (marketMedianArs > 0) {
    const minPrice = marketMedianArs * 0.15;
    const maxPrice = marketMedianArs * 6.00;

    if (input.priceArs < minPrice && !input.isSpecialCard) {
      errors.push(`Price is too low (below 15% of market median ${marketMedianArs} ARS)`);
      isValid = false;
    }

    if (input.priceArs > maxPrice && !input.isSpecialCard) {
      errors.push(`Price is too high (above 600% of market median ${marketMedianArs} ARS)`);
      isValid = false;
    }
  } else if (input.priceArs <= 0) {
    errors.push(`Price must be greater than 0`);
    isValid = false;
  }

  if (sanitizedNotes) {
    // Regex to detect phone numbers, emails, or links
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const linkRegex = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*/g;
    // Basic phone number detection (sequences of 8+ digits, possibly with spaces, dashes, +)
    // Matches like +54 9 11 1234-5678, 1112345678, 11-1234-5678
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?(\d{3,4}[-.\s]?\d{4}|\d{8,})/g;

    let flagged = false;

    if (emailRegex.test(sanitizedNotes)) {
      flagged = true;
      errors.push('Notes contain an email address, which is not allowed.');
    }

    if (linkRegex.test(sanitizedNotes)) {
      flagged = true;
      errors.push('Notes contain an external link, which is not allowed.');
    }

    // Phone numbers can be tricky, let's remove spaces and dashes to check if there are 8 or more contiguous digits
    const digitsOnly = sanitizedNotes.replace(/[\s-()]/g, '');
    const contiguousDigitsRegex = /\d{8,}/;
    if (contiguousDigitsRegex.test(digitsOnly)) {
       flagged = true;
       errors.push('Notes contain a possible phone number, which is not allowed.');
    }

    if (flagged) {
      isValid = false;
      // We'll also just set sanitizedNotes to something safe or redact.
      // But the ticket says "detectar y bloquear automáticamente". Returning isValid = false blocks it.
      // We can also return a [REDACTED] string.
      sanitizedNotes = sanitizedNotes
        .replace(emailRegex, '[REDACTED EMAIL]')
        .replace(linkRegex, '[REDACTED LINK]')
        .replace(phoneRegex, '[REDACTED PHONE]');
    }
  }

  return {
    isValid,
    errors,
    sanitizedNotes,
  };
}
