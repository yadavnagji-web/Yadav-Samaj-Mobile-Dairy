
/**
 * BHIM Mobile Dairy - Language Validation Utility
 * Enforces Devanagari script for all text inputs.
 */

// Regex for Devanagari characters, common punctuation, and spaces
const HINDI_REGEX = /^[ \u0900-\u097F0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

/**
 * Validates if the string contains only Hindi characters (and numbers/punctuation).
 * Specifically blocks English alphabets (A-Z, a-z).
 */
export const isHindiOnly = (text: string): boolean => {
  // Check if any English letters exist
  const hasEnglish = /[a-zA-Z]/.test(text);
  return !hasEnglish;
};

/**
 * Returns an error message if the text is invalid.
 */
export const getLanguageError = (text: string): string | null => {
  if (!text) return null;
  if (!isHindiOnly(text)) {
    return "कृपया केवल हिंदी (देवनागरी) में ही लिखें। अंग्रेजी अक्षरों की अनुमति नहीं है।";
  }
  return null;
};
