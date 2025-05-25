/**
 * Voice Search Debugger Component
 * Real-time testing and debugging interface for voice search functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketplace } from '../../context/MarketplaceContext';
import { voiceSearchValidator, commonTestQueries, ValidationResult } from '../../utils/voiceSearchValidator';
import { nlpService } from '../../services/nlpService';

interface VoiceSearchDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSearchDebugger: React.FC<VoiceSearchDebuggerProps> = ({ isOpen, onClose }) => {
  const { state } = useMarketplace();
  const [testQuery, setTestQuery] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [batchResults, setBatchResults] = useState<ValidationResult[]>([]);
  const [showBatchTest, setShowBatchTest] = useState(false);

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return;

    setIsValidating(true);
    try {
      const result = await voiceSearchValidator.validateQuery(testQuery, state.products);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleBatchTest = async () => {
    setIsValidating(true);
    try {
      const results = await voiceSearchValidator.validateBatch(commonTestQueries, state.products);
      setBatchResults(results);
      setShowBatchTest(true);
    } catch (error) {
      console.error('Batch test error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuickTest = (query: string) => {
    setTestQuery(query);
    setTimeout(() => handleTestQuery(), 100);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'text-green-600';
    if (accuracy >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 0.8) return 'bg-green-100';
    if (accuracy >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">🔍 Voice Search Debugger</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-blue-100 mt-2">Test and validate voice search accuracy with real marketplace data</p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Test Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Query
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTestQuery()}
                  placeholder="Enter a voice search query to test..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTestQuery}
                  disabled={isValidating || !testQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isValidating ? '🔄' : '🧪'} Test
                </button>
              </div>
            </div>

            {/* Quick Test Buttons */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Tests
              </label>
              <div className="flex flex-wrap gap-2">
                {commonTestQueries.slice(0, 8).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickTest(query)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Test */}
            <div className="mb-6">
              <button
                onClick={handleBatchTest}
                disabled={isValidating}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isValidating ? '🔄 Running...' : '📊'} Run Batch Test ({commonTestQueries.length} queries)
              </button>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 border rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-3">🔍 Validation Results</h3>
                
                {/* Accuracy Score */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${getAccuracyBg(validationResult.accuracy)} ${getAccuracyColor(validationResult.accuracy)}`}>
                  Accuracy: {(validationResult.accuracy * 100).toFixed(1)}%
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Query Info */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Query Analysis</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Original:</strong> "{validationResult.query}"</div>
                      {validationResult.correctedQuery !== validationResult.query && (
                        <div><strong>Corrected:</strong> "{validationResult.correctedQuery}"</div>
                      )}
                      <div><strong>Intent:</strong> {validationResult.parsedQuery.intent}</div>
                      <div><strong>Confidence:</strong> {(validationResult.parsedQuery.confidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Entities */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Extracted Entities</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(validationResult.parsedQuery.entities).map(([key, value]) => (
                        value && (
                          <div key={key}>
                            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Performance</h4>
                  <div className="flex gap-4 text-sm">
                    <span>NLP: {validationResult.performance.nlpTime.toFixed(2)}ms</span>
                    <span>Search: {validationResult.performance.searchTime.toFixed(2)}ms</span>
                    <span>Total: {validationResult.performance.totalTime.toFixed(2)}ms</span>
                  </div>
                </div>

                {/* Search Results */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Search Results ({validationResult.searchResults.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {validationResult.searchResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{result.item.name}</span>
                        <span className="text-xs text-gray-500">Score: {(result.score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues and Suggestions */}
                {(validationResult.issues.length > 0 || validationResult.suggestions.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validationResult.issues.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">⚠️ Issues</h4>
                        <ul className="text-sm text-red-600 space-y-1">
                          {validationResult.issues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validationResult.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">💡 Suggestions</h4>
                        <ul className="text-sm text-blue-600 space-y-1">
                          {validationResult.suggestions.map((suggestion, index) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Batch Results */}
            {showBatchTest && batchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-3">📊 Batch Test Results</h3>
                
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {batchResults.length}
                    </div>
                    <div className="text-sm text-blue-700">Total Queries</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {(batchResults.reduce((sum, r) => sum + r.accuracy, 0) / batchResults.length * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-700">Avg Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {batchResults.filter(r => r.accuracy > 0.7).length}
                    </div>
                    <div className="text-sm text-purple-700">Successful</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-2xl font-bold text-orange-600">
                      {batchResults.reduce((sum, r) => sum + r.issues.length, 0)}
                    </div>
                    <div className="text-sm text-orange-700">Total Issues</div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Query</th>
                        <th className="text-center p-2">Accuracy</th>
                        <th className="text-center p-2">Results</th>
                        <th className="text-center p-2">Time</th>
                        <th className="text-center p-2">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((result, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 font-mono text-xs">{result.query}</td>
                          <td className={`text-center p-2 font-medium ${getAccuracyColor(result.accuracy)}`}>
                            {(result.accuracy * 100).toFixed(1)}%
                          </td>
                          <td className="text-center p-2">{result.searchResults.length}</td>
                          <td className="text-center p-2">{result.performance.totalTime.toFixed(0)}ms</td>
                          <td className="text-center p-2">{result.issues.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceSearchDebugger;
