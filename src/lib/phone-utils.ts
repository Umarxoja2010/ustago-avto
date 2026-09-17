/**
 * Utility functions for Uzbekistan phone number formatting, validation, and normalization.
 * Standard format with auto-dashes: +998 90-123-45-67
 */

/**
 * Formats user input as Uzbekistan phone number with automatic dashes:
 * Examples:
 * "90" -> "+998 90"
 * "90123" -> "+998 90-123"
 * "9012345" -> "+998 90-123-45"
 * "901234567" -> "+998 90-123-45-67"
 * Strictly limits to maximum 9 national digits (cannot type more).
 */
export function formatUzPhone(value: string): string {
  // Strip all non-digit characters
  let digits = value.replace(/\D/g, "");

  // If user pasted or typed starting with 998, strip country code to extract the 9 national digits
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }

  // Strictly enforce max 9 digits
  digits = digits.slice(0, 9);

  if (!digits) return "+998 ";

  let res = "+998 ";
  if (digits.length <= 2) {
    res += digits;
  } else if (digits.length <= 5) {
    res += `${digits.slice(0, 2)}-${digits.slice(2)}`;
  } else if (digits.length <= 7) {
    res += `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  } else {
    res += `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
  }

  return res;
}

/**
 * Validates that exactly 9 digits are provided after +998 (neither more, nor less).
 */
export function isValidUzPhone(value: string): boolean {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }
  return digits.length === 9;
}

/**
 * Normalizes phone number to clean E.164-like format for backend API (+998XXXXXXXXX).
 */
export function normalizeUzPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }
  return "+998" + digits.slice(0, 9);
}
