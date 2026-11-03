import React from 'react';
import { Bot, User } from 'lucide-react';

interface BubbleProps {
  sender: 'assistant' | 'user';
  children: React.ReactNode;
  actionChips?: {
    label: string;
    onClick: () => void;
  }[];
  timestamp?: string;
}

export const Bubble: React.FC<BubbleProps> = ({
  sender,
  children,
  actionChips,
  timestamp,
}) => {
  if (sender === 'user') {
    return (
      <div className="flex justify-end w-full group">
        <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
          <div className="rounded-[18px] rounded-tr-[4px] bg-[#14AC8C] text-[#111111] font-medium px-4 py-3 text-[15px] leading-relaxed shadow-sm">
            {children}
          </div>
          {timestamp && (
            <div className="text-[10px] text-[#A1A1A1] text-right pr-2">
              {timestamp}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 sm:gap-3 w-full group">
      {/* 28px circular teal avatar */}
      <div
        className="w-7 h-7 rounded-full bg-[#14AC8C] text-[#111111] flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
        aria-hidden="true"
      >
        <Bot className="w-4 h-4 text-[#111111]" />
      </div>

      <div className="flex-1 max-w-[90%] sm:max-w-[85%] space-y-2">
        <div className="rounded-[18px] rounded-tl-[4px] bg-[#141414] border border-[#1F1F1F] px-4 py-3 text-[#FCFCFC] text-[15px] leading-relaxed shadow-sm">
          {children}
        </div>

        {/* Optional contextual action chips */}
        {actionChips && actionChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {actionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={chip.onClick}
                className="text-[11px] font-semibold uppercase tracking-wider text-[#14AC8C] bg-[#1F1F1F] hover:bg-[#282828] active:scale-95 px-3 py-1 rounded-full transition-all border border-transparent hover:border-[#14AC8C]/30"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {timestamp && (
          <div className="text-[10px] text-[#A1A1A1] pl-1">
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};
