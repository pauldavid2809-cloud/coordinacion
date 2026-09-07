import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('coordinacion_election_state');
    } catch (e) {}
    window.location.reload();
  };

  handleGoHome = () => {
    try {
      localStorage.removeItem('coordinacion_election_state');
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#040714] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full card-senior rounded-3xl p-8 border border-amber-500/30 shadow-2xl space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl"></div>
              <img 
                src="/logo.png" 
                alt="Escudo Santo Tomás de Aquino" 
                className="relative w-20 h-20 mx-auto object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]" 
              />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Actualización de Sesión</span>
              </div>
              <h2 className="text-2xl font-serif font-black text-white">
                Sincronizando la Asamblea
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Se ha detectado una discrepancia en los datos de la asamblea electoral. Haz clic abajo para recargar la sesión oficial.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] text-left overflow-x-auto text-[11px] font-mono text-slate-400 max-h-24">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar Sesión</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
