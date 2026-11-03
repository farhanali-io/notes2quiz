import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface WarningToastProps {
  isVisible: boolean;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export const WarningToast: React.FC<WarningToastProps> = ({
  isVisible,
  onDismiss,
  autoDismissMs = 8000,
}) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [isVisible, autoDismissMs, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className="sticky top-2 z-30 mx-auto max-w-[680px] w-full px-3 py-2.5 rounded-[12px] bg-[#2A1F00] border border-[#FFD166] text-[#FCFCFC] shadow-lg flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div className="shrink-0 mt-0.5 text-[#FFD166]">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <p className="flex-1 text-[13px] leading-relaxed text-[#FFD166]/95">
        Gemini free limit reached. The system has temporarily shifted to another AI. Results may be slightly different from previous ones.
      </p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 rounded-md text-[#FFD166]/80 hover:text-[#FFD166] hover:bg-[#FFD166]/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
