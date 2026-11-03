import React, { useState } from 'react';
import { FlashcardItem } from '../data/mockPacks';
import { RotateCw, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface FlashcardProps {
  cards: FlashcardItem[];
}

export const Flashcard: React.FC<FlashcardProps> = ({ cards }) => {
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
    <div className="space-y-3">
      {/* Flashcard container with flip interaction */}
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
        className="group relative min-h-[170px] sm:min-h-[190px] rounded-[10px] bg-[#1A1A1A] border border-[#262626] hover:border-[#14AC8C]/50 p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none"
      >
        <div className="flex items-center justify-between text-[11px] text-[#A1A1A1]">
          <span className="uppercase tracking-wider font-semibold text-[#14AC8C]">
            {isFlipped ? 'Answer' : 'Question'}
            {currentCard.keyTerm ? ` · ${currentCard.keyTerm}` : ''}
          </span>
          <span className="text-[12px] font-mono">
            {currentIdx + 1} / {cards.length}
          </span>
        </div>

        <div className="my-auto py-3 text-center sm:text-left">
          {isFlipped ? (
            <p className="text-[15px] sm:text-[16px] text-[#FCFCFC] leading-relaxed">
              {currentCard.back}
            </p>
          ) : (
            <p className="text-[15px] sm:text-[16px] font-medium text-[#FCFCFC] leading-relaxed">
              {currentCard.front}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-[11px] text-[#A1A1A1]">
          <span className="flex items-center gap-1 group-hover:text-[#14AC8C] transition-colors">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Tap card to flip</span>
          </span>

          <button
            onClick={toggleMastered}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-colors ${
              masteredIds[currentCard.id]
                ? 'bg-[#14AC8C]/20 text-[#14AC8C]'
                : 'hover:text-[#FCFCFC]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{masteredIds[currentCard.id] ? 'Mastered' : 'Mark Mastered'}</span>
          </button>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={handlePrev}
          aria-label="Previous flashcard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F1F1F] text-[#FCFCFC] text-[12px] font-medium hover:bg-[#2A2A2A] transition-colors min-h-[36px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1.5">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIdx(idx);
              }}
              aria-label={`Jump to card ${idx + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIdx
                  ? 'w-5 bg-[#14AC8C]'
                  : masteredIds[card.id]
                  ? 'bg-[#14AC8C]/40'
                  : 'bg-[#2A2A2A] hover:bg-[#3D3D3D]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next flashcard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F1F1F] text-[#FCFCFC] text-[12px] font-medium hover:bg-[#2A2A2A] transition-colors min-h-[36px]"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
