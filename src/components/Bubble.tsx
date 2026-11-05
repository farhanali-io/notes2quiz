import React from 'react';
import { BookOpen, FileText, CheckCheck, Camera } from 'lucide-react';

export interface FileAttachment {
  name: string;
  size?: string;
  pages?: string;
  type: 'pdf' | 'docx' | 'image' | 'notes';
  ocrAccuracy?: string;
}

interface BubbleProps {
  sender: 'assistant' | 'user';
  children: React.ReactNode;
  actionChips?: {
    label: string;
    onClick: () => void;
  }[];
  timestamp?: string;
  attachments?: FileAttachment[];
  isNightMode?: boolean;
}

export const Bubble: React.FC<BubbleProps> = ({
  sender,
  children,
  actionChips,
  timestamp,
  attachments,
  isNightMode = true,
}) => {
  if (sender === 'user') {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[90%] sm:max-w-[80%] space-y-2">
          {/* File attachments */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] border text-[13px] ${
                    isNightMode
                      ? 'bg-[#141416] border-[#EDEDED]/10 text-[#EDEDED]'
                      : 'bg-[#F2F1EC] border-[#1A1A1A]/10 text-[#1A1A1A]'
                  }`}
                >
                  {file.type === 'image' ? (
                    <Camera className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  ) : (
                    <FileText className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  )}

                  <div className="flex flex-col text-left">
                    <span className="font-medium text-[13px] truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span
                      className={`text-[12px] ${
                        isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      {file.ocrAccuracy
                        ? `${file.ocrAccuracy} OCR accuracy`
                        : `${file.size || 'Attached'} · ${file.pages || 'Document'}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Message */}
          <div
            className={`rounded-[6px] px-4 py-3 text-[15px] leading-[1.6] ${
              isNightMode
                ? 'bg-[#141416] text-[#EDEDED]'
                : 'bg-[#F2F1EC] text-[#1A1A1A]'
            }`}
          >
            {children}
          </div>

          {/* Timestamp */}
          {timestamp && (
            <div
              className={`text-[12px] text-right pr-1 flex items-center justify-end gap-1 ${
                isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
              }`}
            >
              <span>{timestamp}</span>
              <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex items-start gap-3 w-full">
      <div
        className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 border ${
          isNightMode
            ? 'bg-[#141416] border-[#EDEDED]/10 text-[#EDEDED]'
            : 'bg-[#F2F1EC] border-[#1A1A1A]/10 text-[#1A1A1A]'
        }`}
        aria-hidden="true"
      >
        <BookOpen className="w-4 h-4" strokeWidth={1.5} />
      </div>

      <div className="flex-1 max-w-[94%] sm:max-w-[88%] space-y-2">
        <div
          className={`rounded-[6px] px-4 py-3 text-[15px] leading-[1.6] ${
            isNightMode
              ? 'bg-[#141416] text-[#EDEDED]'
              : 'bg-[#F2F1EC] text-[#1A1A1A]'
          }`}
        >
          {children}
        </div>

        {/* Action chips */}
        {actionChips && actionChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {actionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={chip.onClick}
                className={`text-[12px] font-medium px-2.5 py-1 rounded-[6px] transition-colors duration-150 border cursor-pointer ${
                  isNightMode
                    ? 'text-[#EDEDED] bg-[#141416] hover:bg-[#1C1C1F] border-[#EDEDED]/10'
                    : 'text-[#1A1A1A] bg-[#F2F1EC] hover:bg-[#E8E6DF] border-[#1A1A1A]/10'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {timestamp && (
          <div
            className={`text-[12px] pl-1 ${
              isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
            }`}
          >
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};
