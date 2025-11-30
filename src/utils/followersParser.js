/**
 * Parses follower count text into an integer
 * Handles various formats: "2.1K", "3.4M", "12,540", "1,204", null
 * 
 * @param {string|null|undefined} text - Follower count text to parse
 * @returns {number|string} Parsed follower count as integer, or "unknown" if invalid
 * 
 * @example
 * parseFollowers("2.1K") → 2100
 * parseFollowers("3.4M") → 3400000
 * parseFollowers("12,540") → 12540
 * parseFollowers(null) → "unknown"
 */
function parseFollowers(text) {
  // Handle null, undefined, or empty strings
  if (!text || typeof text !== 'string') {
    return 'unknown';
  }

  // Remove any whitespace and convert to uppercase for consistent parsing
  let cleaned = text.trim().toUpperCase().replace(/\s/g, '');

  // Handle empty string after cleaning
  if (!cleaned) {
    return 'unknown';
  }

  // Check for K suffix (thousands)
  if (cleaned.endsWith('K')) {
    const numberPart = cleaned.slice(0, -1).replace(/,/g, '');
    const num = parseFloat(numberPart);
    if (isNaN(num)) {
      return 'unknown';
    }
    return Math.floor(num * 1000);
  }

  // Check for M suffix (millions)
  if (cleaned.endsWith('M')) {
    const numberPart = cleaned.slice(0, -1).replace(/,/g, '');
    const num = parseFloat(numberPart);
    if (isNaN(num)) {
      return 'unknown';
    }
    return Math.floor(num * 1000000);
  }

  // Check for B suffix (billions) - rare but possible
  if (cleaned.endsWith('B')) {
    const numberPart = cleaned.slice(0, -1).replace(/,/g, '');
    const num = parseFloat(numberPart);
    if (isNaN(num)) {
      return 'unknown';
    }
    return Math.floor(num * 1000000000);
  }

  // Handle plain numbers with or without commas
  const numberString = cleaned.replace(/,/g, '');
  const num = parseFloat(numberString);
  
  if (isNaN(num)) {
    return 'unknown';
  }

  return Math.floor(num);
}

module.exports = {
  parseFollowers,
};

