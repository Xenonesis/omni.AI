import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Server, Wifi } from "lucide-react";
import React, { Component, ReactNode } from "react";
import Button from "./Button";
import Card from "./Card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
}

export class APIErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRetrying: false,
    };

    // Listen for API connection events
    window.addEventListener(
      "api-connection-failed",
      this.handleAPIConnectionFailed
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      "api-connection-failed",
      this.handleAPIConnectionFailed
    );
  }

  static getDerivedStateFromError(error: Error): State {
    // Don't show error boundary for OmniDimension widget errors or fallback mode
    const isOmniDimensionError =
      error.message.includes("OmniDimension") ||
      error.message.includes("omnidim") ||
      error.message.includes("web_widget");
    const isFallbackError =
      error.message.includes("fallback") ||
      error.message.includes("Using intelligent fallback");

    if (isOmniDimensionError || isFallbackError) {
      console.log(
        "🔄 Allowing non-critical error to pass through:",
        error.message
      );
      return {
        hasError: false,
        error: null,
        isRetrying: false,
      };
    }

    return {
      hasError: true,
      error,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("API Error Boundary caught an error:", error, errorInfo);
  }

  handleAPIConnectionFailed = (event: CustomEvent) => {
    // In production, don't show error boundary if fallback mode is available
    const isProduction =
      import.meta.env.PROD ||
      import.meta.env.VITE_APP_ENVIRONMENT === "production";
    const hasFallback =
      event.detail.message?.includes("fallback") ||
      event.detail.message?.includes("Using intelligent fallback") ||
      event.detail.message?.includes("Production fallback mode");

    if (isProduction && hasFallback) {
      console.log(
        "🔄 Production environment with fallback mode - not showing error boundary"
      );
      return;
    }

    // Only show error boundary for critical errors in development or when no fallback is available
    this.setState({
      hasError: true,
      error: new Error(event.detail.message),
      isRetrying: false,
    });
  };

  handleRetry = async () => {
    if (this.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });
    this.retryCount++;

    try {
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Try to reload the page to reinitialize everything
      window.location.reload();
    } catch (error) {
      console.error("Retry failed:", error);
      this.setState({ isRetrying: false });
    }
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleStartServer = () => {
    // Open instructions in a new tab
    const instructions = `
To start the API server:

1. Open a new terminal/command prompt
2. Navigate to your project directory
3. Run: node server.js
4. Wait for "🚀 Search API server running on http://localhost:3001"
5. Refresh this page

The server should start on http://localhost:3001
    `;

    alert(instructions);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-8 text-center border-red-200 bg-white shadow-xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Server className="w-10 h-10 text-red-600" />
              </motion.div>

              <h1 className="text-3xl font-bold text-red-900 mb-4">
                API Server Not Available
              </h1>

              <p className="text-red-700 mb-6 text-lg">
                The marketplace API server is not running. This application
                requires the API server to function.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Error Details:
                </h3>
                <p className="text-red-800 font-mono text-sm">
                  {this.state.error?.message || "Unknown API connection error"}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-3">
                  To fix this issue:
                </h3>
                <ol className="text-blue-800 space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      1
                    </span>
                    Open a terminal/command prompt
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      2
                    </span>
                    Navigate to your project directory
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      3
                    </span>
                    Run:{" "}
                    <code className="bg-blue-100 px-2 py-1 rounded font-mono">
                      node server.js
                    </code>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      4
                    </span>
                    Wait for "🚀 Search API server running on
                    http://localhost:3001"
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                      5
                    </span>
                    Click "Retry Connection" below
                  </li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={this.handleRetry}
                  loading={this.state.isRetrying}
                  disabled={this.retryCount >= this.maxRetries}
                  icon={<RefreshCw size={20} />}
                  variant="primary"
                  size="lg"
                >
                  {this.state.isRetrying ? "Retrying..." : "Retry Connection"}
                </Button>

                <Button
                  onClick={this.handleStartServer}
                  icon={<Wifi size={20} />}
                  variant="outline"
                  size="lg"
                >
                  Show Instructions
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  icon={<Server size={20} />}
                  variant="secondary"
                  size="lg"
                >
                  Go Home
                </Button>
              </div>

              {this.retryCount >= this.maxRetries && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-red-600 text-sm"
                >
                  Maximum retry attempts reached. Please start the server
                  manually.
                </motion.div>
              )}

              <div className="mt-6 pt-6 border-t border-red-200">
                <p className="text-red-600 text-sm">
                  <strong>Note:</strong> This application requires a real API
                  connection and cannot function with mock data.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default APIErrorBoundary;
