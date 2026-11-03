import React, { useState } from 'react';
import { ActiveRecallItem } from '../types/studyPack';
import { ChevronDown, ChevronUp, Eye, Lightbulb } from 'lucide-react';

interface ActiveRecallProps {
  items: ActiveRecallItem[];
}

export const ActiveRecall: React.FC<ActiveRecallProps> = ({ items }) => {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleHint = (id: string) => {
    setShowHints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-[8px] bg-[#1F1F1F]/50 border border-[#262626] text-[12px] text-[#A1A1A1] flex items-center gap-2">
        <Eye className="w-4 h-4 text-[#14AC8C] shrink-0" />
        <span>Try answering out loud or on paper before revealing the answer!</span>
      </div>

      {items.map((item, idx) => {
        const isRevealed = !!revealedIds[item.id];
        const hasHint = !!showHints[item.id];

        return (
          <div
            key={item.id}
            className="rounded-[10px] bg-[#1F1F1F]/60 border border-[#262626] overflow-hidden transition-all"
          >
            <div className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-[#14AC8C] uppercase tracking-wider">
                  Question {idx + 1} · {item.concept}
                </span>
                <button
                  onClick={() => toggleHint(item.id)}
                  className="flex items-center gap-1 text-[11px] text-[#FFD166] hover:underline"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>{hasHint ? 'Hide hint' : 'Hint'}</span>
                </button>
              </div>

              <p className="text-[14px] sm:text-[15px] font-medium text-[#FCFCFC] leading-snug">
                {item.question}
              </p>

              {hasHint && (
                <div className="p-2 rounded-[6px] bg-[#2A1F00] border border-[#FFD166]/30 text-[#FFD166] text-[12px]">
                  💡 <strong>Hint:</strong> {item.hint}
                </div>
              )}

              <button
                onClick={() => toggleReveal(item.id)}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[8px] text-[12px] font-medium transition-colors ${
                  isRevealed
                    ? 'bg-[#141414] text-[#A1A1A1] hover:text-[#FCFCFC]'
                    : 'bg-[#14AC8C]/15 text-[#14AC8C] hover:bg-[#14AC8C]/25 border border-[#14AC8C]/30'
                }`}
              >
                <span>{isRevealed ? 'Hide Answer' : 'Reveal Answer'}</span>
                {isRevealed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isRevealed && (
              <div className="bg-[#141414] p-3.5 border-t border-[#262626] text-[13px] sm:text-[14px] text-[#FCFCFC] leading-relaxed animate-in fade-in duration-200">
                <div className="text-[11px] font-semibold text-[#14AC8C] uppercase tracking-wider mb-1">
                  Model Answer
                </div>
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
