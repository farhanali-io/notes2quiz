import React from 'react';
import { ShieldCheck, Moon } from 'lucide-react';

interface SessionBannerProps {
  vaultName?: string;
  sessionId?: string;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
}

export const SessionBanner: React.FC<SessionBannerProps> = ({
  vaultName = 'FAST-NUCES Academic Vault',
  sessionId = 'BIO-301-OCT18',
  isNightMode = true,
  onToggleNightMode,
}) => {
  return (
    <div className="h-9 px-4 sm:px-6 bg-[#0E101A] border-b border-[#171A27] flex items-center justify-between text-[11px] text-[#737A8C] shrink-0 select-none">
      <div className="flex items-center gap-2 truncate">
        <span className="w-1.5 h-1.5 rounded-full bg-[#14AC8C] shrink-0" />
        <span className="text-[#A1A1A1] truncate">
          Session Synced • <strong className="text-[#FCFCFC] font-medium">{vaultName}</strong>
        </span>
        <span className="hidden sm:inline-block text-[#525866]">•</span>
        <span className="hidden sm:inline-block font-mono text-[#737A8C]">
          ID: {sessionId}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onToggleNightMode && (
          <button
            type="button"
            onClick={onToggleNightMode}
            className="flex items-center gap-1.5 text-[#FFD166] hover:text-[#ffe29a] transition-colors cursor-pointer"
          >
            <Moon className="w-3 h-3 text-[#FFD166]" />
            <span className="text-[11px] font-medium">Night Study Mode • {isNightMode ? 'ON' : 'OFF'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
