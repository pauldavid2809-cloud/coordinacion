import React, { useState, useEffect } from 'react';
import Navbar from './components/Common/Navbar';
import LoginModal from './components/Auth/LoginModal';
import SeminaristaDashboard from './components/Seminarista/SeminaristaDashboard';
import RectorDashboard from './components/Rector/RectorDashboard';
import ToastNotification from './components/Common/ToastNotification';
import { getCurrentSession, logout } from './services/authService';
import { subscribeToSeminaristas, subscribeToSolicitudes } from './services/supabaseService.js';
import { 
  Church, 
  ShieldCheck, 
  User, 
  Calendar, 
  Wrench, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight,
  Share2
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(() => getCurrentSession());
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginInitialTab, setLoginInitialTab] = useState('seminarista');
  const [seminaristas, setSeminaristas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Suscripción a Firestore en tiempo real
  useEffect(() => {
    const unsubSem = subscribeToSeminaristas((list) => {
      setSeminaristas(list);
    });

    const unsubSol = subscribeToSolicitudes((items) => {
      setSolicitudes(items);
    });

    return () => {
      if (unsubSem) unsubSem();
      if (unsubSol) unsubSol();
    };
  }, []);

  const handleLogout = () => {
    logout();
    setSession(null);
    setToastMessage('Sesión cerrada correctamente.');
  };

  const handleLoginSuccess = (newSession) => {
    setSession(newSession);
    setToastMessage(`Bienvenido, ${newSession.user?.nombre || 'Usuario'}.`);
  };

  const abrirLogin = (tab = 'seminarista') => {
    setLoginInitialTab(tab);
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-500 selection:text-white">
      
      {/* Barra de Navegación Institucional */}
      <Navbar
        session={session}
        onLogout={handleLogout}
        onOpenLogin={() => abrirLogin('seminarista')}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {session?.role === 'rector' ? (
          <RectorDashboard
            solicitudes={solicitudes}
            seminaristas={seminaristas}
            onNotify={(msg) => setToastMessage(msg)}
          />
        ) : session?.role === 'seminarista' ? (
          <SeminaristaDashboard
            seminarista={session.user}
            solicitudes={solicitudes}
            onNotify={(msg) => setToastMessage(msg)}
          />
        ) : (
          /* Pantalla de Bienvenida / Acceso Rápido para Invitados */
          <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 animate-fadeIn">
            
            {/* Hero Principal */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-amber-500/30 shadow-2xl text-center relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="h-28 sm:h-36 w-auto mx-auto flex items-center justify-center my-2">
                  <img 
                    src="/logo.png" 
                    alt="Escudo Seminario Santo Tomás de Aquino - Sacerdos Lux" 
                    className="h-full w-auto object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <h1 className="font-serif font-black text-2xl sm:text-4xl text-amber-100 tracking-tight leading-tight">
                  Seminario Mayor Santo Tomás de Aquino
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-light max-w-xl mx-auto">
                  Arquidiócesis de Maracaibo • Sistema Oficial de Permisos, Necesidades de Coordinación y Propuestas Comunitarias 2026-2027
                </p>

                {/* Botones de Acceso Rápido */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => abrirLogin('seminarista')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <User className="w-4 h-4" />
                    <span>Ingresar con Cédula (Seminaristas)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => abrirLogin('rector')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Acceso de Rectoría</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tres Pilares del Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div 
                onClick={() => abrirLogin('seminarista')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-amber-200">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                  Permisos de Salida
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Petición y resolución formal de salidas médicas, familiares y pastorales con pase digital oficial y código para WhatsApp.
                </p>
              </div>

              <div 
                onClick={() => abrirLogin('seminarista')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-sky-200">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-sky-700 transition-colors">
                  Necesidades de Coordinación
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Reportes de insumos, reparaciones y materiales para liturgia, música, biblioteca y áreas de la casa de formación.
                </p>
              </div>

              <div 
                onClick={() => abrirLogin('seminarista')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-indigo-200">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Propuestas Formativas
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Iniciativas comunitarias, apostólicas y recreativas para edificar la fraternidad y enriquecer la formación sacerdotal.
                </p>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Pie de Página Institucional */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-serif font-bold text-slate-700">
            Seminario Mayor Arquidiocesano Santo Tomás de Aquino
          </p>
          <p className="text-[11px] text-slate-400">
            Arquidiócesis de Maracaibo, Venezuela • Padrón Oficial 2026-2027
          </p>
        </div>
      </footer>

      {/* Modal de Autenticación */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        seminaristas={seminaristas}
      />

      {/* Notificaciones Flotantes */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />

    </div>
  );
}
