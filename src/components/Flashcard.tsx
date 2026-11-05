import React, { useState } from 'react';
import { FlashcardItem } from '../types/studyPack';
import { RotateCw, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface FlashcardProps {
  cards: FlashcardItem[];
  isNightMode?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({ cards, isNightMode = true }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Record<string, boolean>>({});

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIdx];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const toggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds((prev) => ({
      ...prev,
      [currentCard.id]: !prev[currentCard.id],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Flashcard surface (0px radius on card) */}
      <div
        onClick={toggleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        }}
        aria-label="Flashcard. Press to flip."
        className={`group relative min-h-[176px] rounded-none border p-5 flex flex-col justify-between cursor-pointer transition-colors duration-150 select-none ${
          isNightMode
            ? 'bg-[#0B0B0C] border-[#EDEDED]/10 hover:bg-[#1C1C1F]/60 text-[#EDEDED]'
            : 'bg-[#FAFAF7] border-[#1A1A1A]/10 hover:bg-[#E8E6DF]/60 text-[#1A1A1A]'
        }`}
      >
        <div
          className={`flex items-center justify-between text-[12px] ${
            isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
          }`}
        >
          <span className="font-medium">
            {isFlipped ? 'Answer' : 'Question'}
            {currentCard.keyTerm ? ` · ${currentCard.keyTerm}` : ''}
          </span>
          <span>
            {currentIdx + 1} / {cards.length}
          </span>
        </div>

        <div className="my-auto py-4 text-center sm:text-left">
          <p className="text-[16px] font-medium leading-[1.6]">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
        </div>

        <div
          className={`flex items-center justify-between pt-3 border-t text-[12px] ${
            isNightMode
              ? 'border-[#EDEDED]/10 text-[#8A8A8A]'
              : 'border-[#1A1A1A]/10 text-[#6B6B6B]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Click to flip</span>
          </span>

          <button
            type="button"
            onClick={toggleMastered}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors duration-150 cursor-pointer ${
              masteredIds[currentCard.id]
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'hover:text-[#EDEDED]'
                : 'hover:text-[#1A1A1A]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{masteredIds[currentCard.id] ? 'Mastered' : 'Mark mastered'}</span>
          </button>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous flashcard"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
            isNightMode
              ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F]'
              : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF]'
          }`}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1.5">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCurrentIdx(idx);
              }}
              aria-label={`Jump to card ${idx + 1}`}
              className={`h-1.5 rounded-[2px] transition-colors duration-150 cursor-pointer ${
                idx === currentIdx
                  ? 'w-4 bg-[#2D4A3E]'
                  : masteredIds[card.id]
                  ? 'w-1.5 bg-[#2D4A3E]/50'
                  : isNightMode
                  ? 'w-1.5 bg-[#EDEDED]/20 hover:bg-[#EDEDED]/40'
                  : 'w-1.5 bg-[#1A1A1A]/20 hover:bg-[#1A1A1A]/40'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next flashcard"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
            isNightMode
              ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F]'
              : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF]'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
