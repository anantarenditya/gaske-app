'use client';

import { Bell, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface NotificationProps {
  show: boolean;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
}

export default function Notification({ show, title, message, type = 'success', onClose }: NotificationProps) {
  if (!show) return null;

  const bgColors = {
    success: 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100',
    info: 'bg-slate-900/95 border-slate-700 text-slate-100',
    warning: 'bg-amber-950/95 border-amber-500/50 text-amber-100',
  };

  const iconColors = {
    success: 'text-emerald-400 bg-emerald-500/20',
    info: 'text-blue-400 bg-blue-500/20',
    warning: 'text-amber-400 bg-amber-500/20',
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full transition-all duration-300">
      <div className={`backdrop-blur-xl border p-4 rounded-2xl shadow-2xl flex items-start gap-3.5 ${bgColors[type]}`}>
        <div className={`p-2 rounded-xl shrink-0 ${iconColors[type]}`}>
          {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {type === 'warning' && <AlertTriangle className="w-5 h-5" />}
          {type === 'info' && <Bell className="w-5 h-5" />}
        </div>
        
        <div className="flex-1 pr-2">
          <h4 className="text-xs font-black uppercase tracking-wider">{title}</h4>
          <p className="text-xs mt-0.5 opacity-90 leading-relaxed font-medium">{message}</p>
        </div>

        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}