import React, { useState } from 'react';
import { ActiveRecallItem } from '../types/studyPack';
import { ChevronDown, ChevronUp, Eye, Lightbulb } from 'lucide-react';

interface ActiveRecallProps {
  items: ActiveRecallItem[];
  isNightMode?: boolean;
}

export const ActiveRecall: React.FC<ActiveRecallProps> = ({ items, isNightMode = true }) => {
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
    <div className="space-y-4">
      <div
        className={`pb-3 border-b text-[13px] flex items-center gap-2 ${
          isNightMode
            ? 'border-[#EDEDED]/10 text-[#8A8A8A]'
            : 'border-[#1A1A1A]/10 text-[#6B6B6B]'
        }`}
      >
        <Eye className="w-4 h-4 shrink-0" strokeWidth={1.5} />
        <span>Answer out loud or on paper before revealing the answer.</span>
      </div>

      {items.map((item, idx) => {
        const isRevealed = !!revealedIds[item.id];
        const hasHint = !!showHints[item.id];

        return (
          <div
            key={item.id}
            className={`rounded-none overflow-hidden ${
              isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
            }`}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[12px] font-medium ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  Question {idx + 1} · {item.concept}
                </span>
                <button
                  type="button"
                  onClick={() => toggleHint(item.id)}
                  className={`flex items-center gap-1 text-[12px] hover:underline cursor-pointer ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{hasHint ? 'Hide hint' : 'Hint'}</span>
                </button>
              </div>

              <p className="text-[15px] font-medium leading-[1.6]">
                {item.question}
              </p>

              {hasHint && (
                <div
                  className={`p-3 rounded-none border-l-2 border-[#2D4A3E] text-[13px] ${
                    isNightMode
                      ? 'bg-[#141416] text-[#8A8A8A]'
                      : 'bg-[#F2F1EC] text-[#6B6B6B]'
                  }`}
                >
                  <span className="font-medium">Hint: </span>
                  {item.hint}
                </div>
              )}

              <button
                type="button"
                onClick={() => toggleReveal(item.id)}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  isRevealed
                    ? isNightMode
                      ? 'bg-[#141416] text-[#8A8A8A] hover:text-[#EDEDED]'
                      : 'bg-[#F2F1EC] text-[#6B6B6B] hover:text-[#1A1A1A]'
                    : 'bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED]'
                }`}
              >
                <span>{isRevealed ? 'Hide answer' : 'Reveal answer'}</span>
                {isRevealed ? (
                  <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>

            {isRevealed && (
              <div
                className={`p-4 border-t text-[14px] leading-[1.6] ${
                  isNightMode
                    ? 'bg-[#141416] border-[#EDEDED]/10 text-[#EDEDED]'
                    : 'bg-[#F2F1EC] border-[#1A1A1A]/10 text-[#1A1A1A]'
                }`}
              >
                <div
                  className={`text-[12px] font-medium mb-1 ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  Model answer
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
