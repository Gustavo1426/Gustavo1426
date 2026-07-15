import React, { ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Telemetry } from "../shared/infrastructure/monitoring/Telemetry";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Telemetry.logError(error, {
      componentStack: errorInfo.componentStack,
      type: "react_component_crash"
    });
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121315] text-[#e3e2e4] flex flex-col items-center justify-center p-6 font-sans">
          <div className="glass-panel w-full max-w-md p-8 rounded-xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center flex flex-col items-center">
            
            {/* Pulsing Icon Container */}
            <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 animate-pulse">
              <AlertOctagon size={32} />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              System Anomaly Detected
            </h1>
            
            {/* Message */}
            <p className="text-sm text-[#b9cacb] mb-6 leading-relaxed">
              An unexpected runtime error occurred within the interface layout. The telemetry engine has logged this event.
            </p>

            {/* Error Stack Extract */}
            {this.state.error && (
              <div className="w-full bg-[#0d0e10] border border-[#3a494b]/20 p-4 rounded-lg font-mono text-xs text-red-300 text-left overflow-auto max-h-32 mb-6">
                {this.state.error.message}
                <br />
                {this.state.error.stack && (
                  <span className="opacity-50 text-[10px] block mt-1">
                    {this.state.error.stack.split("\n")[1]}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={this.handleReset}
              className="primary-gradient w-full py-3 px-4 rounded-lg text-black font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw size={18} className="animate-spin-slow" />
              Reset & Reload View
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
