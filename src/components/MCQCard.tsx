import React, { useState } from 'react';
import { MCQItem } from '../data/mockPacks';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface MCQCardProps {
  items: MCQItem[];
}

export const MCQCard: React.FC<MCQCardProps> = ({ items }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const handleSelect = (questionId: string, optionIndex: number) => {
    // Only set if not already selected, or allow changing
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  return (
    <div className="space-y-4">
      {items.map((item, qIdx) => {
        const selected = selectedAnswers[item.id];
        const isAnswered = selected !== undefined;
        const isCorrect = isAnswered && selected === item.correctIndex;

        return (
          <div
            key={item.id}
            className="rounded-[10px] bg-[#1F1F1F]/60 border border-[#262626] p-3.5 sm:p-4 space-y-3 transition-colors"
          >
            <div className="flex items-start gap-2.5 justify-between">
              <span className="text-[12px] font-bold text-[#14AC8C] shrink-0 mt-0.5">
                Q{qIdx + 1}.
              </span>
              <p className="text-[14px] sm:text-[15px] text-[#FCFCFC] font-medium leading-snug flex-1">
                {item.question}
              </p>
            </div>

            {/* 4 Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {item.options.map((option, optIdx) => {
                const isThisSelected = selected === optIdx;
                const isThisCorrect = optIdx === item.correctIndex;

                let borderStyle = 'border-[#2D2D2D] hover:border-[#3D3D3D] hover:bg-[#262626]';
                let textStyle = 'text-[#FCFCFC]';
                let icon = null;

                if (isAnswered) {
                  if (isThisCorrect) {
                    borderStyle = 'border-[#14AC8C] bg-[#14AC8C]/10';
                    textStyle = 'text-[#FCFCFC] font-medium';
                    icon = <CheckCircle2 className="w-4 h-4 text-[#14AC8C] shrink-0" />;
                  } else if (isThisSelected && !isThisCorrect) {
                    borderStyle = 'border-rose-500/80 bg-rose-500/10';
                    textStyle = 'text-rose-200';
                    icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
                  } else {
                    borderStyle = 'border-[#222222] opacity-50';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(item.id, optIdx)}
                    className={`flex items-center justify-between gap-2 text-left p-3 rounded-[8px] border text-[13px] sm:text-[14px] transition-all cursor-pointer min-h-[44px] ${borderStyle} ${textStyle}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold bg-[#141414] text-[#A1A1A1] border border-[#2D2D2D] shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation box shown after user taps */}
            {isAnswered && (
              <div
                className={`text-[12px] p-2.5 rounded-[8px] flex items-start gap-2 border ${
                  isCorrect
                    ? 'bg-[#14AC8C]/10 border-[#14AC8C]/30 text-[#FCFCFC]'
                    : 'bg-[#1F1F1F] border-[#2D2D2D] text-[#A1A1A1]'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-[#14AC8C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#14AC8C] mr-1">
                    {isCorrect ? 'Correct!' : `Correct Answer: Option ${String.fromCharCode(65 + item.correctIndex)}.`}
                  </span>
                  <span>{item.explanation}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
