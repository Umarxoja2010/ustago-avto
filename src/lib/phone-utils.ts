/**
 * Utility functions for Uzbekistan phone number formatting, validation, and normalization.
 * Standard format with auto-dashes: +998 90-123-45-67
 */

/**
 * Extracts clean 9 national digits of Uzbekistan phone number from any input.
 * Handles pasted full numbers, existing +998 prefixes, and edge cases.
 */
export function extractUzNationalDigits(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "");

  // If user pasted a full number (+998...) into an input that already contained +998:
  // e.g. "998998901234567" -> double 998 prefix
  if (digits.startsWith("998998") && digits.length >= 15) {
    digits = digits.slice(6);
  } else if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }

  // Strictly maximum 9 digits
  return digits.slice(0, 9);
}

/**
 * Formats user input as Uzbekistan phone number with automatic dashes:
 * Examples:
 * "90" -> "+998 90"
 * "90123" -> "+998 90-123"
 * "9012345" -> "+998 90-123-45"
 * "901234567" -> "+998 90-123-45-67"
 */
export function formatUzPhone(value: string): string {
  const digits = extractUzNationalDigits(value);
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
 * Validates that exactly 9 digits are provided for Uzbekistan (+998 XX-XXX-XX-XX).
 */
export function isValidUzPhone(value: string): boolean {
  const digits = extractUzNationalDigits(value);
  return digits.length === 9;
}

/**
 * Normalizes phone number to clean E.164-like format for backend API (+998XXXXXXXXX).
 */
export function normalizeUzPhone(value: string): string {
  const digits = extractUzNationalDigits(value);
  return "+998" + digits;
}
