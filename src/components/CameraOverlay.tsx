import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface CameraOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (subject: string) => void;
}

const SUBJECTS = ['Biology', 'Chemistry', 'Math', 'Other'];

export const CameraOverlay: React.FC<CameraOverlayProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [selectedSubject, setSelectedSubject] = useState('Biology');

  if (!isOpen) return null;

  const handleShutter = () => {
    onCapture(selectedSubject);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Camera scan overlay for handwritten notes"
      className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col justify-between p-4 sm:p-6 text-[#FCFCFC] select-none"
    >
      {/* Top Bar */}
      <header className="w-full max-w-[720px] mx-auto flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {SUBJECTS.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  isSelected
                    ? 'bg-[#14AC8C] text-[#111111] font-semibold shadow-sm'
                    : 'bg-[#1F1F1F] text-[#A1A1A1] hover:text-[#FCFCFC] hover:bg-[#282828]'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera scanner"
          className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[#A1A1A1] hover:text-[#FCFCFC] hover:bg-[#2A2A2A] transition-colors shrink-0 min-h-[40px] min-w-[40px]"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Center: Fake camera preview area */}
      <main className="w-full max-w-[720px] mx-auto flex-1 my-4 flex items-center justify-center">
        <div className="relative w-full max-w-[460px] aspect-[3/4] sm:aspect-[4/5] rounded-[16px] bg-[#141414] border border-[#222222] overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Subtle simulated paper document inside frame */}
          <div className="absolute inset-8 rounded-[8px] bg-[#1A1A1A]/80 border border-white/5 flex flex-col justify-between p-6 opacity-60 pointer-events-none">
            <div className="space-y-3">
              <div className="h-3 w-1/3 bg-[#333333] rounded" />
              <div className="h-2 w-full bg-[#2A2A2A] rounded" />
              <div className="h-2 w-5/6 bg-[#2A2A2A] rounded" />
              <div className="h-2 w-4/6 bg-[#2A2A2A] rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-[#2A2A2A] rounded" />
              <div className="h-2 w-3/4 bg-[#2A2A2A] rounded" />
            </div>
          </div>

          {/* 3x3 Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div />
          </div>

          {/* 4 Teal Corner Brackets */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-[#14AC8C] pointer-events-none" />
          <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-[#14AC8C] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#14AC8C] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#14AC8C] pointer-events-none" />

          {/* Center scan label */}
          <div className="z-10 text-center px-4">
            <span className="text-[12px] font-mono tracking-wider uppercase text-[#14AC8C] bg-[#0A0A0A]/80 px-2.5 py-1 rounded-full border border-[#14AC8C]/30">
              Camera preview · {selectedSubject}
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Bar: Shutter button + helper line */}
      <footer className="w-full max-w-[720px] mx-auto flex flex-col items-center gap-3 shrink-0 pb-2">
        {/* 64px circular shutter button */}
        <button
          type="button"
          onClick={handleShutter}
          aria-label="Capture handwritten note photo"
          title="Capture notes"
          className="w-16 h-16 rounded-full bg-white border-4 border-[#14AC8C] flex items-center justify-center active:scale-95 transition-all shadow-[0_0_24px_rgba(20,172,140,0.4)] cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-white active:bg-zinc-200 transition-colors" />
        </button>

        <p className="text-[13px] text-[#A1A1A1] text-center font-normal">
          Align your notes inside the frame
        </p>
      </footer>
    </div>
  );
};
