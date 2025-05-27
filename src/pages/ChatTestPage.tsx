import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
// Chat components removed - using only OmniDimension widget script

const ChatTestPage: React.FC = () => {
  const [scriptStatus, setScriptStatus] = useState<{
    loaded: boolean;
    error: string | null;
    widgetFound: boolean;
  }>({
    loaded: false,
    error: null,
    widgetFound: false,
  });

  const checkScriptStatus = () => {
    try {
      // Check if script element exists
      const scriptElement = document.querySelector("#omnidimension-web-widget");
      const scriptLoaded = !!scriptElement;

      // Check for global objects
      const widgetFound = !!(window.OmniDimensionWidget || window.omnidim);

      // Check for any widget elements in DOM
      const widgetElements = document.querySelectorAll(
        '[data-omnidim-widget], [class*="omnidim"], [id*="omnidim"]'
      );

      setScriptStatus({
        loaded: scriptLoaded,
        error: null,
        widgetFound: widgetFound || widgetElements.length > 0,
      });

      console.log("🔍 Script Status Check:", {
        scriptElement: !!scriptElement,
        scriptSrc: scriptElement?.getAttribute("src"),
        globalOmniDimensionWidget: !!window.OmniDimensionWidget,
        globalOmnidim: !!window.omnidim,
        widgetElements: widgetElements.length,
        allScripts: Array.from(document.querySelectorAll("script"))
          .map((s) => s.src)
          .filter((src) => src.includes("omnidim") || src.includes("widget")),
      });
    } catch (error) {
      setScriptStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  useEffect(() => {
    checkScriptStatus();
    const interval = setInterval(checkScriptStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const testWidgetOpen = () => {
    try {
      // Try multiple methods to open widget
      if (
        window.OmniDimensionWidget &&
        typeof window.OmniDimensionWidget.open === "function"
      ) {
        window.OmniDimensionWidget.open();
        console.log("✅ Opened via OmniDimensionWidget.open()");
        return;
      }

      if (window.omnidim && typeof window.omnidim.open === "function") {
        window.omnidim.open();
        console.log("✅ Opened via omnidim.open()");
        return;
      }

      // Try clicking widget elements
      const widgetButton = document.querySelector(
        "[data-omnidim-widget], .omnidim-widget-button, #omnidim-widget-button"
      );
      if (widgetButton) {
        (widgetButton as HTMLElement).click();
        console.log("✅ Clicked widget button");
        return;
      }

      console.warn("❌ No widget opening method found");
      alert("Widget not available yet. Please wait for it to load.");
    } catch (error) {
      console.error("❌ Error testing widget:", error);
      alert(
        "Error testing widget: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Bot className="w-8 h-8 mr-3 text-blue-600" />
            Chat System Test Page
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Script Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Script Status
              </h2>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {scriptStatus.loaded ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>
                    Script Element:{" "}
                    {scriptStatus.loaded ? "Found" : "Not Found"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {scriptStatus.widgetFound ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>
                    Widget Available: {scriptStatus.widgetFound ? "Yes" : "No"}
                  </span>
                </div>

                {scriptStatus.error && (
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span className="text-red-600 text-sm">
                      {scriptStatus.error}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={checkScriptStatus}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Widget Test */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-600" />
                Widget Test
              </h2>

              <p className="text-gray-600 mb-4">
                Test if the OmniDimension widget can be opened programmatically.
              </p>

              <button
                onClick={testWidgetOpen}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Test Widget Open
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              What to Look For:
            </h2>
            <ul className="space-y-2 text-blue-800">
              <li>
                • <strong>Debug Button:</strong> Look for a bot icon in the
                top-left corner
              </li>
              <li>
                • <strong>Chat Button:</strong> Look for a gradient chat button
                in the bottom-right corner
              </li>
              <li>
                • <strong>OmniDimension Widget:</strong> Should appear as a
                floating widget (usually bottom-right)
              </li>
              <li>
                • <strong>Console Logs:</strong> Check browser console for any
                errors or widget status messages
              </li>
            </ul>
          </div>

          {/* Current URL Info */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Current Page Info:</h3>
            <p className="text-sm text-gray-600">URL: {window.location.href}</p>
            <p className="text-sm text-gray-600">
              User Agent: {navigator.userAgent.substring(0, 100)}...
            </p>
          </div>
        </motion.div>
      </div>

      {/* Chat components removed - using only OmniDimension widget script */}
    </div>
  );
};

export default ChatTestPage;
