/**
 * Voice Search Validator
 * Real-time validation and debugging utility for voice search accuracy
 */

import { nlpService } from '../services/nlpService';
import { FuzzySearchEngine, correctSpelling } from './fuzzySearch';
import { Product } from '../types/marketplace';

export interface ValidationResult {
  query: string;
  correctedQuery: string;
  parsedQuery: any;
  searchResults: any[];
  accuracy: number;
  suggestions: string[];
  issues: string[];
  performance: {
    nlpTime: number;
    searchTime: number;
    totalTime: number;
  };
}

export interface ValidationConfig {
  enableSpellCorrection: boolean;
  fuzzyThreshold: number;
  minConfidence: number;
  maxResults: number;
  enablePhonetic: boolean;
  enableLogging: boolean;
}

export class VoiceSearchValidator {
  private config: ValidationConfig;
  private fuzzySearch: FuzzySearchEngine;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      enableSpellCorrection: true,
      fuzzyThreshold: 0.2,
      minConfidence: 0.3,
      maxResults: 10,
      enablePhonetic: true,
      enableLogging: true,
      ...config
    };

    this.fuzzySearch = new FuzzySearchEngine({
      threshold: this.config.fuzzyThreshold,
      keys: ['name', 'brand', 'description', 'tags'],
      shouldSort: true,
      includeScore: true,
    });
  }

  /**
   * Validate a voice search query against a product catalog
   */
  async validateQuery(query: string, products: Product[]): Promise<ValidationResult> {
    const startTime = performance.now();
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Step 1: Spell correction
    const nlpStartTime = performance.now();
    let correctedQuery = query;
    if (this.config.enableSpellCorrection) {
      correctedQuery = correctSpelling(query);
      if (correctedQuery !== query) {
        suggestions.push(`Spell correction applied: "${query}" → "${correctedQuery}"`);
      }
    }

    // Step 2: NLP parsing
    const parsedQuery = nlpService.parseQuery(correctedQuery);
    const nlpTime = performance.now() - nlpStartTime;

    // Validate NLP results
    if (parsedQuery.confidence < this.config.minConfidence) {
      issues.push(`Low confidence score: ${parsedQuery.confidence.toFixed(2)}`);
      suggestions.push('Consider rephrasing the query for better recognition');
    }

    if (parsedQuery.intent === 'unknown') {
      issues.push('Intent not recognized');
      suggestions.push('Try using keywords like "find", "search", or "show me"');
    }

    // Step 3: Search execution
    const searchStartTime = performance.now();
    const searchResults = this.fuzzySearch.search(correctedQuery, products);
    const searchTime = performance.now() - searchStartTime;

    // Validate search results
    if (searchResults.length === 0) {
      issues.push('No products found');
      suggestions.push('Try broader search terms or check spelling');
    } else if (searchResults.length > this.config.maxResults) {
      suggestions.push(`Many results found (${searchResults.length}). Consider adding filters`);
    }

    // Calculate accuracy score
    const accuracy = this.calculateAccuracy(parsedQuery, searchResults);

    const totalTime = performance.now() - startTime;

    const result: ValidationResult = {
      query,
      correctedQuery,
      parsedQuery,
      searchResults: searchResults.slice(0, this.config.maxResults),
      accuracy,
      suggestions,
      issues,
      performance: {
        nlpTime,
        searchTime,
        totalTime,
      },
    };

    if (this.config.enableLogging) {
      this.logValidation(result);
    }

    return result;
  }

  /**
   * Calculate accuracy score based on various factors
   */
  private calculateAccuracy(parsedQuery: any, searchResults: any[]): number {
    let score = 0;
    let factors = 0;

    // Intent recognition (20%)
    if (parsedQuery.intent !== 'unknown') {
      score += 0.2;
    }
    factors++;

    // Entity extraction (30%)
    const entityCount = Object.keys(parsedQuery.entities).filter(
      key => parsedQuery.entities[key] !== undefined && parsedQuery.entities[key] !== null
    ).length;
    score += Math.min(entityCount * 0.1, 0.3);
    factors++;

    // Search results relevance (30%)
    if (searchResults.length > 0) {
      const avgScore = searchResults.reduce((sum, result) => sum + result.score, 0) / searchResults.length;
      score += avgScore * 0.3;
    }
    factors++;

    // Confidence score (20%)
    score += parsedQuery.confidence * 0.2;
    factors++;

    return Math.min(score, 1.0);
  }

  /**
   * Log validation results for debugging
   */
  private logValidation(result: ValidationResult): void {
    console.group('🔍 Voice Search Validation');
    console.log('📝 Query:', result.query);
    if (result.correctedQuery !== result.query) {
      console.log('✏️ Corrected:', result.correctedQuery);
    }
    console.log('🎯 Accuracy:', `${(result.accuracy * 100).toFixed(1)}%`);
    console.log('⚡ Performance:', `${result.performance.totalTime.toFixed(2)}ms`);

    if (result.parsedQuery) {
      console.log('🧠 NLP Results:', {
        intent: result.parsedQuery.intent,
        entities: result.parsedQuery.entities,
        confidence: result.parsedQuery.confidence.toFixed(2),
      });
    }

    if (result.searchResults.length > 0) {
      console.log('📊 Search Results:', result.searchResults.length, 'products found');
      console.log('🏆 Top Result:', result.searchResults[0]?.item?.name);
    }

    if (result.issues.length > 0) {
      console.warn('⚠️ Issues:', result.issues);
    }

    if (result.suggestions.length > 0) {
      console.info('💡 Suggestions:', result.suggestions);
    }

    console.groupEnd();
  }

  /**
   * Batch validate multiple queries
   */
  async validateBatch(queries: string[], products: Product[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const query of queries) {
      const result = await this.validateQuery(query, products);
      results.push(result);
    }

    // Generate batch summary
    const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    const avgTime = results.reduce((sum, r) => sum + r.performance.totalTime, 0) / results.length;
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

    console.group('📊 Batch Validation Summary');
    console.log('📈 Average Accuracy:', `${(avgAccuracy * 100).toFixed(1)}%`);
    console.log('⚡ Average Time:', `${avgTime.toFixed(2)}ms`);
    console.log('⚠️ Total Issues:', totalIssues);
    console.log('✅ Success Rate:', `${(results.filter(r => r.accuracy > 0.7).length / results.length * 100).toFixed(1)}%`);
    console.groupEnd();

    return results;
  }

  /**
   * Generate test report
   */
  generateReport(results: ValidationResult[]): string {
    const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    const successCount = results.filter(r => r.accuracy > 0.7).length;
    const issueCount = results.reduce((sum, r) => sum + r.issues.length, 0);

    return `
# Voice Search Accuracy Report

## Summary
- **Total Queries Tested**: ${results.length}
- **Average Accuracy**: ${(avgAccuracy * 100).toFixed(1)}%
- **Success Rate**: ${(successCount / results.length * 100).toFixed(1)}%
- **Total Issues Found**: ${issueCount}

## Detailed Results

${results.map((result, index) => `
### Query ${index + 1}: "${result.query}"
- **Accuracy**: ${(result.accuracy * 100).toFixed(1)}%
- **Corrected**: ${result.correctedQuery}
- **Intent**: ${result.parsedQuery.intent}
- **Entities**: ${JSON.stringify(result.parsedQuery.entities, null, 2)}
- **Results Found**: ${result.searchResults.length}
- **Performance**: ${result.performance.totalTime.toFixed(2)}ms
${result.issues.length > 0 ? `- **Issues**: ${result.issues.join(', ')}` : ''}
${result.suggestions.length > 0 ? `- **Suggestions**: ${result.suggestions.join(', ')}` : ''}
`).join('\n')}

## Recommendations

${avgAccuracy < 0.7 ? '- Consider improving NLP patterns for better entity extraction' : ''}
${issueCount > results.length * 0.3 ? '- Review spell correction dictionary for common misspellings' : ''}
${results.some(r => r.performance.totalTime > 100) ? '- Optimize search performance for faster response times' : ''}
`;
  }
}

// Common test queries for Indian marketplace
export const commonTestQueries = [
  'iPhone 14 Pro Max',
  'Samsung Galaxy Buds',
  'Nike Air Force 1',
  'L\'Oreal serum',
  'aple iphone', // misspelling
  'samsang earbuds', // misspelling
  'naik shoes', // misspelling
  'mobile phone under 50000',
  'shoes under Rs 10000',
  'beauty products for face',
  'find samsung wireless earbuds',
  'show me nike sneakers',
  'electronics under 25000',
  'fashion items for men',
  'cosmetics for women',
  'smartphone with good camera',
  'wireless headphones',
  'running shoes',
  'anti aging cream',
  'laptop under 100000',
];

// Create default validator instance
export const voiceSearchValidator = new VoiceSearchValidator();

/**
 * Quick validation function for testing
 */
export async function quickValidate(query: string, products: Product[]): Promise<void> {
  const result = await voiceSearchValidator.validateQuery(query, products);
  console.log(`Query: "${query}" | Accuracy: ${(result.accuracy * 100).toFixed(1)}% | Results: ${result.searchResults.length}`);
}
