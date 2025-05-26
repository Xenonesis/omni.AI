import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { openOmniDimensionWidget } from '../../utils/omniDimensionWidget';

interface DebugInfo {
  scriptLoaded: boolean;
  widgetAvailable: boolean;
  globalObjects: string[];
  widgetElements: number;
  lastError: string | null;
}

const OmniDimensionDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    scriptLoaded: false,
    widgetAvailable: false,
    globalObjects: [],
    widgetElements: 0,
    lastError: null
  });
  const [isVisible, setIsVisible] = useState(false);

  const checkWidgetStatus = () => {
    try {
      const scriptElement = document.querySelector('#omniverse-web-widget, #omnidimension-web-widget, script[src*="web_widget.js"]');
      const scriptLoaded = !!scriptElement;

      const globalObjects = [];
      if (window.OmniDimensionWidget) globalObjects.push('OmniDimensionWidget');
      if (window.omnidim) globalObjects.push('omnidim');

      const widgetSelectors = [
        '[data-omnidim-widget]',
        '.omnidim-widget-button',
        '#omnidim-widget-button',
        '[id*="omnidim"]',
        '[class*="omnidim"]',
        'iframe[src*="omnidim"]'
      ];

      let widgetElements = 0;
      widgetSelectors.forEach(selector => {
        widgetElements += document.querySelectorAll(selector).length;
      });

      const widgetAvailable = globalObjects.length > 0 || widgetElements > 0;

      setDebugInfo({
        scriptLoaded,
        widgetAvailable,
        globalObjects,
        widgetElements,
        lastError: null
      });
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const testWidget = async () => {
    try {
      const success = openOmniDimensionWidget();
      if (!success) {
        setDebugInfo(prev => ({
          ...prev,
          lastError: 'Widget open attempt failed'
        }));
      }
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Test failed'
      }));
    }
  };

  useEffect(() => {
    checkWidgetStatus();
    const interval = setInterval(checkWidgetStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle OmniDimension Debug"
      >
        <Bot className="w-5 h-5" />
      </motion.button>

      {/* Debug Panel */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="fixed top-16 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">OmniDimension Debug</h3>
            <button
              onClick={checkWidgetStatus}
              className="p-1 hover:bg-gray-100 rounded"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* Script Status */}
            <div className="flex items-center space-x-2">
              {debugInfo.scriptLoaded ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Script Loaded: {debugInfo.scriptLoaded ? 'Yes' : 'No'}</span>
            </div>

            {/* Widget Available */}
            <div className="flex items-center space-x-2">
              {debugInfo.widgetAvailable ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Widget Available: {debugInfo.widgetAvailable ? 'Yes' : 'No'}</span>
            </div>

            {/* Global Objects */}
            <div>
              <span className="font-medium">Global Objects:</span>
              <div className="ml-2 text-gray-600">
                {debugInfo.globalObjects.length > 0 ? (
                  debugInfo.globalObjects.map(obj => (
                    <div key={obj} className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{obj}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-1">
                    <XCircle className="w-3 h-3 text-red-500" />
                    <span>None found</span>
                  </div>
                )}
              </div>
            </div>

            {/* Widget Elements */}
            <div>
              <span className="font-medium">Widget Elements: {debugInfo.widgetElements}</span>
            </div>

            {/* Last Error */}
            {debugInfo.lastError && (
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <span className="font-medium">Last Error:</span>
                  <div className="text-red-600 text-xs mt-1">{debugInfo.lastError}</div>
                </div>
              </div>
            )}

            {/* Test Button */}
            <button
              onClick={testWidget}
              className="w-full bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors"
            >
              Test Widget Open
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default OmniDimensionDebug;
