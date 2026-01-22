import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error: error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                    <div className="max-w-xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-red-100">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
                            <p className="text-slate-600 mb-6">The application encountered an error. Please try refreshing the page.</p>

                            <details className="bg-slate-100 p-4 rounded-lg overflow-auto max-h-64 text-sm font-mono text-slate-800">
                                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                                <div className="whitespace-pre-wrap">
                                    {this.state.error && this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </div>
                            </details>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                                >
                                    Reload Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
