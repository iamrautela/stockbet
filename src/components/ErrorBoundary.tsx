import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-300 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-sm text-gray-400">
                <summary className="cursor-pointer mb-2">Error Details</summary>
                <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 