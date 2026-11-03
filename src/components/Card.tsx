import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CardProps {
  title: string;
  badge?: string;
  copyContent?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  badge,
  copyContent,
  children,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyContent) return;
    try {
      await navigator.clipboard.writeText(copyContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article
      className={`rounded-[12px] bg-[#141414] border border-[#1F1F1F] p-4 sm:p-5 text-[#FCFCFC] transition-colors ${className}`}
    >
      <header className="flex items-center justify-between pb-3 mb-3 border-b border-[#1F1F1F] gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#14AC8C]">
            {title}
          </span>
          {badge && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1F1F1F] text-[#A1A1A1] border border-[#2A2A2A]">
              {badge}
            </span>
          )}
        </div>
        {copyContent && (
          <button
            onClick={handleCopy}
            aria-label={`Copy ${title} content`}
            title="Copy section"
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#A1A1A1] hover:text-[#FCFCFC] hover:bg-[#1F1F1F] rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#14AC8C]" />
                <span className="text-[#14AC8C] font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        )}
      </header>
      <div className="space-y-3">{children}</div>
    </article>
  );
};
