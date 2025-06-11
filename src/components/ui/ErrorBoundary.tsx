import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto"
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-400 text-sm">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-dark text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center space-x-2 bg-dark-lighter hover:bg-dark-light text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-dark-lighter p-4 rounded-lg">
                <summary className="text-red-400 cursor-pointer mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-gray-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}