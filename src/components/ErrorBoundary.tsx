import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center py-16 px-4">
          <div className="max-w-md text-center">
            <div className="text-8xl font-black text-gray-100 select-none leading-none mb-4">!</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-500 mb-8 font-light">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
