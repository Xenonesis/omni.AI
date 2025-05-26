import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, AlertCircle, CheckCircle, Loader, Settings } from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { callVoiceAgentAPI } from '../../services/voiceAgentApi';
import { apiConnection } from '../../services/apiConnection';

const VoiceSearchDebug: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Check voice support
    const supported = voiceService.isSupported();
    setIsSupported(supported);
    
    // Check API status
    const status = apiConnection.getStatus();
    setApiStatus(status.isConnected ? 'connected' : 'disconnected');
    
    console.log('🔍 Voice Debug - Voice supported:', supported);
    console.log('🔍 Voice Debug - API status:', status);
  }, []);

  const testVoiceRecognition = async () => {
    setError(null);
    setTestResults([]);
    
    try {
      console.log('🎤 Testing voice recognition...');
      
      await voiceService.startListening({
        onStart: () => {
          console.log('✅ Voice recognition started');
          setIsListening(true);
          setTestResults(prev => [...prev, { test: 'Voice Start', status: 'success', message: 'Voice recognition started successfully' }]);
        },
        onResult: (text: string, isFinal: boolean) => {
          console.log('🎤 Voice result:', text, 'Final:', isFinal);
          setTranscript(text);
          if (isFinal) {
            setTestResults(prev => [...prev, { test: 'Voice Recognition', status: 'success', message: `Recognized: "${text}"` }]);
            setIsListening(false);
          }
        },
        onError: (errorMessage: string) => {
          console.error('❌ Voice error:', errorMessage);
          setError(errorMessage);
          setIsListening(false);
          setTestResults(prev => [...prev, { test: 'Voice Recognition', status: 'error', message: errorMessage }]);
        },
        onEnd: () => {
          console.log('🎤 Voice recognition ended');
          setIsListening(false);
        }
      });
    } catch (error: any) {
      console.error('❌ Voice test failed:', error);
      setError(error.message);
      setTestResults(prev => [...prev, { test: 'Voice Recognition', status: 'error', message: error.message }]);
    }
  };

  const testVoiceAgent = async () => {
    try {
      console.log('🤖 Testing voice agent API...');
      
      const testPayload = {
        transcript: 'hello test',
        timestamp: new Date().toISOString(),
        sessionId: 'debug_session',
        realTimeMode: true,
        userPreferences: {
          personality: 'helpful',
          voiceEnabled: true,
          realTimeMode: true
        }
      };

      const response = await callVoiceAgentAPI(testPayload);
      console.log('✅ Voice agent response:', response);
      
      setTestResults(prev => [...prev, { 
        test: 'Voice Agent API', 
        status: 'success', 
        message: `API responded: "${response.text || response.message}"` 
      }]);
    } catch (error: any) {
      console.error('❌ Voice agent test failed:', error);
      setTestResults(prev => [...prev, { 
        test: 'Voice Agent API', 
        status: 'error', 
        message: error.message 
      }]);
    }
  };

  const testTextToSpeech = async () => {
    try {
      console.log('🗣️ Testing text-to-speech...');
      await voiceService.speak('Hello, this is a test of the text to speech system.');
      setTestResults(prev => [...prev, { 
        test: 'Text-to-Speech', 
        status: 'success', 
        message: 'Text-to-speech working correctly' 
      }]);
    } catch (error: any) {
      console.error('❌ Text-to-speech test failed:', error);
      setTestResults(prev => [...prev, { 
        test: 'Text-to-Speech', 
        status: 'error', 
        message: error.message 
      }]);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testVoiceAgent();
    await testTextToSpeech();
    // Don't auto-start voice recognition to avoid permission issues
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🔍 Voice Search Debug Panel</h2>
      
      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Voice Support</h3>
          <div className="flex items-center space-x-2">
            {isSupported ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <AlertCircle className="text-red-500" size={20} />
            )}
            <span>{isSupported ? 'Supported' : 'Not Supported'}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">API Status</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-500' : 
              apiStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="capitalize">{apiStatus}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Browser</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                                      navigator.userAgent.includes('Edge') ? 'Edge' : 
                                      navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}</span>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={runAllTests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run All Tests
        </button>
        
        <button
          onClick={testVoiceRecognition}
          disabled={!isSupported || isListening}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {isListening ? 'Listening...' : 'Test Voice Recognition'}
        </button>
        
        <button
          onClick={testVoiceAgent}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Test Voice Agent API
        </button>
        
        <button
          onClick={testTextToSpeech}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Test Text-to-Speech
        </button>
      </div>

      {/* Current Transcript */}
      {transcript && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Current Transcript:</h3>
          <p className="text-blue-800">"{transcript}"</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2 text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Test Results:</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded">
                {result.status === 'success' ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <AlertCircle className="text-red-500" size={16} />
                )}
                <span className="font-medium">{result.test}:</span>
                <span className={result.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔧 Troubleshooting Tips:</h3>
        <ul className="text-sm space-y-1 text-yellow-800">
          <li>• Make sure you're using Chrome or Edge browser</li>
          <li>• Allow microphone permissions when prompted</li>
          <li>• Ensure you're on HTTPS (required for voice API)</li>
          <li>• Check that your microphone is working in other applications</li>
          <li>• Try refreshing the page if tests fail</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceSearchDebug;
