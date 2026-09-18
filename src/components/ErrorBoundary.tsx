import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught render error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.removeItem('dd_leader_user');
      localStorage.removeItem('dd_worker_user');
    } catch (e) {
      // ignore
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F17] text-[#E6EDF3] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#280D12] border border-[#5C1D24] flex items-center justify-center text-[#EF4444]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[15px] font-medium text-[#E6EDF3]">Unexpected Application Error</h2>
                <p className="text-[12px] text-[#8B949E]">The application encountered a render exception.</p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-5 p-3 rounded-lg bg-[#0E131F] border border-[#21262D] font-mono text-[11px] text-[#EF4444] overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-[12px] font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset State & Reload App
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="flex-1 px-3 py-2 bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] text-[11.5px] font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#30363D]"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reload Page
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="flex-1 px-3 py-2 bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] text-[11.5px] font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#30363D]"
                >
                  <Home className="w-3 h-3" />
                  Go Home
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
