import React, { useEffect, useState } from 'react';

interface ThinkingDotsProps {
  statusMessages?: string[];
}

export const ThinkingDots: React.FC<ThinkingDotsProps> = ({
  statusMessages = [
    'Reading your notes…',
    'Structuring your pack…',
    'Formulating high-yield questions…',
    'Almost done…',
  ],
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % statusMessages.length);
    }, 900);
    return () => clearInterval(interval);
  }, [statusMessages.length]);

  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="flex items-center gap-1.5" aria-label="Thinking indicator">
        <span
          className="w-2 h-2 rounded-[2px] bg-[#2D4A3E] animate-pulse"
          style={{ animationDuration: '900ms', animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 rounded-[2px] bg-[#2D4A3E] animate-pulse"
          style={{ animationDuration: '900ms', animationDelay: '250ms' }}
        />
        <span
          className="w-2 h-2 rounded-[2px] bg-[#2D4A3E] animate-pulse"
          style={{ animationDuration: '900ms', animationDelay: '500ms' }}
        />
      </div>
      <span className="text-[13px] text-[#8A8A8A] transition-opacity duration-150">
        {statusMessages[currentIdx]}
      </span>
    </div>
  );
};
