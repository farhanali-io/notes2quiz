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
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-1.5" aria-label="Thinking indicator">
        <span
          className="w-2.5 h-2.5 rounded-full bg-[#14AC8C] animate-pulse"
          style={{ animationDuration: '900ms', animationDelay: '0ms' }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-[#14AC8C] animate-pulse"
          style={{ animationDuration: '900ms', animationDelay: '250ms' }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-[#14AC8C] animate-pulse"
          style={{ animationDuration: '900ms', animationDelay: '500ms' }}
        />
      </div>
      <span className="text-xs text-[#A1A1A1] italic transition-opacity duration-200">
        {statusMessages[currentIdx]}
      </span>
    </div>
  );
};
