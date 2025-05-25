/**
 * Fuzzy Search Utility for Enhanced Voice Search Accuracy
 * Provides phonetic matching, spell correction, and similarity scoring
 */

export interface FuzzySearchResult {
  item: any;
  score: number;
  matches: string[];
}

export interface FuzzySearchOptions {
  threshold: number;
  includeScore: boolean;
  includeMatches: boolean;
  minMatchCharLength: number;
  shouldSort: boolean;
  keys: string[];
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is exact match)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Phonetic matching using Soundex algorithm
 */
export function soundex(str: string): string {
  const code = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (code.length === 0) return '0000';

  const firstLetter = code[0];
  const mapping: Record<string, string> = {
    'B': '1', 'F': '1', 'P': '1', 'V': '1',
    'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
    'D': '3', 'T': '3',
    'L': '4',
    'M': '5', 'N': '5',
    'R': '6'
  };

  let soundexCode = firstLetter;
  let prevCode = mapping[firstLetter] || '0';

  for (let i = 1; i < code.length && soundexCode.length < 4; i++) {
    const currentCode = mapping[code[i]] || '0';
    if (currentCode !== '0' && currentCode !== prevCode) {
      soundexCode += currentCode;
    }
    if (currentCode !== '0') {
      prevCode = currentCode;
    }
  }

  return soundexCode.padEnd(4, '0');
}

/**
 * Check if two strings sound similar using Soundex
 */
export function soundsLike(str1: string, str2: string): boolean {
  return soundex(str1) === soundex(str2);
}

/**
 * Enhanced fuzzy search with multiple matching strategies
 */
export class FuzzySearchEngine {
  private options: FuzzySearchOptions;

  constructor(options: Partial<FuzzySearchOptions> = {}) {
    this.options = {
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      keys: [],
      ...options
    };
  }

  /**
   * Search through items using fuzzy matching
   */
  search(query: string, items: any[]): FuzzySearchResult[] {
    const normalizedQuery = query.toLowerCase().trim();
    const results: FuzzySearchResult[] = [];

    for (const item of items) {
      const searchableText = this.extractSearchableText(item);
      const score = this.calculateMatchScore(normalizedQuery, searchableText);
      
      if (score >= this.options.threshold) {
        results.push({
          item,
          score,
          matches: this.findMatches(normalizedQuery, searchableText)
        });
      }
    }

    if (this.options.shouldSort) {
      results.sort((a, b) => b.score - a.score);
    }

    return results;
  }

  /**
   * Extract searchable text from item based on configured keys
   */
  private extractSearchableText(item: any): string {
    if (this.options.keys.length === 0) {
      return typeof item === 'string' ? item : JSON.stringify(item);
    }

    const texts: string[] = [];
    for (const key of this.options.keys) {
      const value = this.getNestedValue(item, key);
      if (value) {
        texts.push(String(value));
      }
    }

    return texts.join(' ').toLowerCase();
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Calculate comprehensive match score
   */
  private calculateMatchScore(query: string, text: string): number {
    const words = query.split(/\s+/);
    const textWords = text.split(/\s+/);
    
    let totalScore = 0;
    let matchCount = 0;

    for (const queryWord of words) {
      let bestWordScore = 0;

      for (const textWord of textWords) {
        // Exact match
        if (queryWord === textWord) {
          bestWordScore = Math.max(bestWordScore, 1.0);
          continue;
        }

        // Starts with match
        if (textWord.startsWith(queryWord) || queryWord.startsWith(textWord)) {
          bestWordScore = Math.max(bestWordScore, 0.8);
          continue;
        }

        // Contains match
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
          bestWordScore = Math.max(bestWordScore, 0.6);
          continue;
        }

        // Phonetic match
        if (soundsLike(queryWord, textWord)) {
          bestWordScore = Math.max(bestWordScore, 0.7);
          continue;
        }

        // Similarity match
        const similarity = calculateSimilarity(queryWord, textWord);
        if (similarity >= 0.6) {
          bestWordScore = Math.max(bestWordScore, similarity * 0.8);
        }
      }

      if (bestWordScore > 0) {
        totalScore += bestWordScore;
        matchCount++;
      }
    }

    // Normalize score based on query length
    return matchCount > 0 ? totalScore / words.length : 0;
  }

  /**
   * Find specific matches in text
   */
  private findMatches(query: string, text: string): string[] {
    const matches: string[] = [];
    const words = query.split(/\s+/);
    const textWords = text.split(/\s+/);

    for (const queryWord of words) {
      for (const textWord of textWords) {
        if (textWord.includes(queryWord) || 
            queryWord.includes(textWord) || 
            soundsLike(queryWord, textWord) ||
            calculateSimilarity(queryWord, textWord) >= 0.7) {
          matches.push(textWord);
        }
      }
    }

    return [...new Set(matches)]; // Remove duplicates
  }
}

/**
 * Common misspellings and corrections for Indian marketplace
 */
export const commonCorrections: Record<string, string> = {
  // Brand corrections
  'aple': 'apple',
  'appl': 'apple',
  'samsang': 'samsung',
  'samung': 'samsung',
  'oneplus': 'oneplus',
  'won plus': 'oneplus',
  'xiaomi': 'xiaomi',
  'shaomi': 'xiaomi',
  'realme': 'realme',
  'real me': 'realme',
  'oppo': 'oppo',
  'vivo': 'vivo',
  'nike': 'nike',
  'naik': 'nike',
  'adidas': 'adidas',
  'addidas': 'adidas',
  'puma': 'puma',
  'pooma': 'puma',
  
  // Product corrections
  'iphone': 'iphone',
  'i phone': 'iphone',
  'i-phone': 'iphone',
  'galaxy': 'galaxy',
  'galxy': 'galaxy',
  'earbuds': 'earbuds',
  'ear buds': 'earbuds',
  'headphones': 'headphones',
  'head phones': 'headphones',
  'smartphone': 'smartphone',
  'smart phone': 'smartphone',
  'laptop': 'laptop',
  'lap top': 'laptop',
  
  // Category corrections
  'electronics': 'electronics',
  'electronic': 'electronics',
  'fashion': 'fashion',
  'fashon': 'fashion',
  'beauty': 'beauty',
  'beuty': 'beauty',
  'cosmetics': 'cosmetics',
  'cosmetic': 'cosmetics',
};

/**
 * Apply spell correction to query
 */
export function correctSpelling(query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const correctedWords = words.map(word => commonCorrections[word] || word);
  return correctedWords.join(' ');
}
