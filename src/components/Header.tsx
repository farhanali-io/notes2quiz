import { Bot, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onResetChat: () => void;
  onToggleFallback: () => void;
  isFallbackActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onResetChat,
  onToggleFallback,
  isFallbackActive = false,
}) => {
  return (
    <header className="h-14 border-b border-[#1F1F1F] bg-[#0A0A0A] px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20">
      <div className="max-w-[720px] mx-auto w-full flex items-center justify-between gap-4">
        {/* Left: 32px circular bot avatar (solid teal fill) + text "Notes2Quiz" + tiny "AI Study Tutor" */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full bg-[#14AC8C] text-[#111111] flex items-center justify-center font-bold shadow-sm"
            aria-hidden="true"
          >
            <Bot className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[15px] sm:text-[16px] text-[#FCFCFC] tracking-tight">
                Notes2Quiz
              </span>
              <span className="hidden sm:inline-block text-[10px] text-[#A1A1A1]/70 font-normal">
                by Farhan Ali
              </span>
            </div>
            <span className="text-[11px] text-[#A1A1A1] -mt-0.5">
              AI Study Tutor
            </span>
          </div>
        </div>

        {/* Right side controls: New Chat button */}
        <div className="flex items-center gap-2">

          {/* New Chat pill button */}
          <button
            type="button"
            onClick={onResetChat}
            aria-label="Start new chat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F1F1F] text-[#A1A1A1] hover:text-[#FCFCFC] hover:bg-[#282828] active:scale-95 transition-all text-[12px] font-medium border border-transparent hover:border-[#2D2D2D] cursor-pointer min-h-[34px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
