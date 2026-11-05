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
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-[640px] w-[90vw] px-4 py-2.5 rounded-[6px] bg-[#141416] border border-[#EDEDED]/15 text-[#EDEDED] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-start gap-3 transition-opacity duration-150"
    >
      <div className="shrink-0 mt-0.5 text-[#8A8A8A]">
        <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
      </div>
      <p className="flex-1 text-[13px] leading-[1.6] text-[#EDEDED]">
        Primary model limit reached. Switched to fallback AI model; results may vary slightly.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 rounded-[4px] text-[#8A8A8A] hover:text-[#EDEDED] transition-colors duration-150 cursor-pointer"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
  );
};
