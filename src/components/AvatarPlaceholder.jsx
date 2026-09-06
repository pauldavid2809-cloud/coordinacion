import React from 'react';

export default function AvatarPlaceholder({ className = "w-full h-full", name = "" }) {
  // Generate initials
  const initials = name
    .split(',')
    .map(part => part.trim())[0]
    ?.split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('') || 'ST';

  return (
    <div className={`relative flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border border-amber-500/20 text-amber-300 select-none overflow-hidden ${className}`}>
      {/* Decorative background cross pattern */}
      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 stroke-amber-400" fill="none" strokeWidth="2">
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="25" y1="35" x2="75" y2="35" />
          <circle cx="50" cy="35" r="14" />
        </svg>
      </div>

      {/* Stylized Clerical Silhouette / Collar */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-900/60 border border-amber-500/40 flex items-center justify-center text-amber-200 font-bold text-sm sm:text-base shadow-inner">
          {initials}
        </div>
        {/* Roman clerical collar notch */}
        <div className="mt-1.5 w-7 h-2 bg-slate-100 rounded-sm shadow-md border-t border-slate-300"></div>
      </div>
    </div>
  );
}
