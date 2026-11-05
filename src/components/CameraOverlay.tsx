import React, { useState } from 'react';
import { X } from 'lucide-react';

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
      className="fixed inset-0 z-50 bg-[#0B0B0C] flex flex-col justify-between p-4 sm:p-6 text-[#EDEDED] select-none"
    >
      {/* Top Bar */}
      <header className="w-full max-w-[720px] mx-auto flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {SUBJECTS.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#2D4A3E] text-[#EDEDED]'
                    : 'bg-[#141416] text-[#8A8A8A] hover:text-[#EDEDED]'
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
          className="w-9 h-9 rounded-[6px] bg-[#141416] flex items-center justify-center text-[#8A8A8A] hover:text-[#EDEDED] transition-colors duration-150 shrink-0 cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </header>

      {/* Center: Camera preview area */}
      <main className="w-full max-w-[720px] mx-auto flex-1 my-4 flex items-center justify-center">
        <div className="relative w-full max-w-[460px] aspect-[3/4] sm:aspect-[4/5] rounded-none bg-[#141416] border border-[#EDEDED]/15 overflow-hidden flex items-center justify-center">
          {/* 3x3 Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-[#EDEDED]/10" />
            <div className="border-r border-b border-[#EDEDED]/10" />
            <div className="border-b border-[#EDEDED]/10" />
            <div className="border-r border-b border-[#EDEDED]/10" />
            <div className="border-r border-b border-[#EDEDED]/10" />
            <div className="border-b border-[#EDEDED]/10" />
            <div className="border-r border-[#EDEDED]/10" />
            <div className="border-r border-[#EDEDED]/10" />
            <div />
          </div>

          {/* 4 Corner Brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#2D4A3E] pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#2D4A3E] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#2D4A3E] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#2D4A3E] pointer-events-none" />

          {/* Center scan label */}
          <div className="z-10 text-center px-4">
            <span className="text-[13px] font-medium text-[#EDEDED] bg-[#0B0B0C] px-3 py-1.5 rounded-[6px] border border-[#EDEDED]/15">
              Camera preview · {selectedSubject}
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Bar: Shutter button */}
      <footer className="w-full max-w-[720px] mx-auto flex flex-col items-center gap-3 shrink-0 pb-2">
        <button
          type="button"
          onClick={handleShutter}
          aria-label="Capture handwritten note photo"
          title="Capture notes"
          className="w-16 h-16 rounded-full bg-[#EDEDED] border-4 border-[#2D4A3E] flex items-center justify-center transition-opacity duration-150 hover:opacity-90 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-[#EDEDED]" />
        </button>

        <p className="text-[13px] text-[#8A8A8A] text-center">
          Align your notes inside the frame
        </p>
      </footer>
    </div>
  );
};
