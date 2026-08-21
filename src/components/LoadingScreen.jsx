import React from 'react';
import dermAuraLogo from '../dermAuraLogoNoBG.png';
import { ShieldCheck } from 'lucide-react';

export default function LoadingScreen({ message = 'Verifying secure clinical session...' }) {
  return (
    <div className="min-h-screen w-full bg-stone-50 text-stone-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      {/* Soft Background Botanical Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        {/* Animated Brand Pulse Container */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Spinner Ring */}
          <div className="w-24 h-24 rounded-full border-3 border-emerald-100 border-t-emerald-600 animate-spin" />
          
          {/* Logo Center */}
          <div className="absolute inset-0 m-auto w-14 h-14 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center p-2">
            <img
              src={dermAuraLogo}
              alt="DermAura"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        </div>

        {/* Text & Status */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Derm<span className="text-emerald-600">Aura</span>
          </h2>
          <p className="text-xs text-stone-600 font-medium">
            {message}
          </p>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-stone-200 rounded-full text-[10px] font-mono text-emerald-800 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit Encrypted Tele-Health</span>
        </div>
      </div>
    </div>
  );
}
