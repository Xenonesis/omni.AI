/**
 * Microphone Test Modal Component
 * Helps users diagnose and fix voice recognition issues
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle, X, Settings } from 'lucide-react';
import { microphoneTest, MicrophoneTestResult } from '../../utils/microphoneTest';

interface MicrophoneTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MicrophoneTestModal: React.FC<MicrophoneTestModalProps> = ({ isOpen, onClose }) => {
  const [testResult, setTestResult] = useState<MicrophoneTestResult | null>(null);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingSpeech, setIsTestingSpeech] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [speechTestResult, setSpeechTestResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      runMicrophoneTest();
    }
    return () => {
      if (isMonitoring) {
        microphoneTest.stopMonitoring();
        setIsMonitoring(false);
      }
    };
  }, [isOpen]);

  const runMicrophoneTest = async () => {
    setIsTestingMic(true);
    try {
      const result = await microphoneTest.runTest();
      setTestResult(result);
    } catch (error) {
      console.error('Microphone test failed:', error);
    } finally {
      setIsTestingMic(false);
    }
  };

  const startAudioMonitoring = async () => {
    try {
      setIsMonitoring(true);
      await microphoneTest.startMonitoring((level) => {
        setAudioLevel(level);
      });
    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
      setIsMonitoring(false);
    }
  };

  const stopAudioMonitoring = () => {
    microphoneTest.stopMonitoring();
    setIsMonitoring(false);
    setAudioLevel(0);
  };

  const testSpeechRecognition = async () => {
    setIsTestingSpeech(true);
    setSpeechTestResult(null);

    try {
      const result = await microphoneTest.testSpeechRecognition();
      setSpeechTestResult(result);
    } catch (error) {
      setSpeechTestResult({
        isWorking: false,
        error: `Test failed: ${error}`,
        suggestions: ['Try refreshing the page', 'Check browser compatibility']
      });
    } finally {
      setIsTestingSpeech(false);
    }
  };

  const getStatusIcon = (isWorking: boolean) => {
    return isWorking ? (
      <CheckCircle className="text-green-500" size={20} />
    ) : (
      <AlertCircle className="text-red-500" size={20} />
    );
  };

  const getStatusColor = (isWorking: boolean) => {
    return isWorking ? 'text-green-600' : 'text-red-600';
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
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">🎤 Microphone Test</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl"
                aria-label="Close microphone test"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-blue-100 mt-2">Diagnose and fix voice recognition issues</p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Test Results */}
            {testResult && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">🔍 Diagnostic Results</h3>

                <div className="space-y-3">
                  {/* Browser Support */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Browser Support</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.isSupported)}
                      <span className={getStatusColor(testResult.isSupported)}>
                        {testResult.isSupported ? 'Supported' : 'Not Supported'}
                      </span>
                    </div>
                  </div>

                  {/* Microphone Permission */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Microphone Permission</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.hasPermission)}
                      <span className={getStatusColor(testResult.hasPermission)}>
                        {testResult.hasPermission ? 'Granted' : 'Denied'}
                      </span>
                    </div>
                  </div>

                  {/* Microphone Functionality */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Microphone Working</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(testResult.isWorking)}
                      <span className={getStatusColor(testResult.isWorking)}>
                        {testResult.isWorking ? 'Working' : 'Not Working'}
                      </span>
                    </div>
                  </div>

                  {/* Audio Level */}
                  {testResult.audioLevel > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Audio Level</span>
                        <span className="text-sm text-gray-600">{Math.round(testResult.audioLevel)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(testResult.audioLevel * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Device Info */}
                  {testResult.deviceInfo && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Microphone Device</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {testResult.deviceInfo.label || 'Default Microphone'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Issues and Suggestions */}
                {(testResult.issues.length > 0 || testResult.suggestions.length > 0) && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testResult.issues.length > 0 && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-800 mb-2">⚠️ Issues Found</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {testResult.issues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {testResult.suggestions.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">💡 Suggestions</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {testResult.suggestions.map((suggestion, index) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Live Audio Monitoring */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">🎵 Live Audio Test</h3>

              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={isMonitoring ? stopAudioMonitoring : startAudioMonitoring}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isMonitoring
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isMonitoring ? <MicOff size={16} /> : <Mic size={16} />}
                  <span>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</span>
                </button>

                <span className="text-sm text-gray-600">
                  {isMonitoring ? 'Speak into your microphone' : 'Click to test microphone input'}
                </span>
              </div>

              {/* Audio Level Visualization */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Audio Input Level</span>
                  <span className="text-sm text-gray-600">{Math.round(audioLevel)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    className={`h-4 rounded-full transition-all duration-100 ${
                      audioLevel > 50 ? 'bg-green-500' : audioLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {audioLevel > 50 ? '✅ Good audio level' :
                   audioLevel > 20 ? '⚠️ Low audio level - speak louder' :
                   '❌ No audio detected'}
                </p>
              </div>
            </div>

            {/* Speech Recognition Test */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">🗣️ Speech Recognition Test</h3>

              <button
                type="button"
                onClick={testSpeechRecognition}
                disabled={isTestingSpeech}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Volume2 size={16} />
                <span>{isTestingSpeech ? 'Testing...' : 'Test Speech Recognition'}</span>
              </button>

              {speechTestResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  speechTestResult.isWorking
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(speechTestResult.isWorking)}
                    <span className={`font-medium ${getStatusColor(speechTestResult.isWorking)}`}>
                      {speechTestResult.isWorking ? 'Speech Recognition Working' : 'Speech Recognition Failed'}
                    </span>
                  </div>

                  {speechTestResult.error && (
                    <p className="text-sm text-red-700 mb-2">{speechTestResult.error}</p>
                  )}

                  {speechTestResult.suggestions && speechTestResult.suggestions.length > 0 && (
                    <ul className="text-sm space-y-1">
                      {speechTestResult.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-gray-700">• {suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={runMicrophoneTest}
                disabled={isTestingMic}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Settings size={16} />
                <span>{isTestingMic ? 'Testing...' : 'Run Test Again'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MicrophoneTestModal;
