import React from 'react';
import { Bot, FileText, CheckCheck, Camera, FileCode } from 'lucide-react';

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
      <div className="flex justify-end w-full group animate-in fade-in">
        <div className="max-w-[90%] sm:max-w-[80%] space-y-2">
          {/* File attachments badge if present */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[10px] border text-[12px] shadow-xs ${
                    isNightMode
                      ? 'bg-[#141828] border-[#1E253E] text-white'
                      : 'bg-white border-slate-300 text-slate-800 shadow-slate-100'
                  }`}
                >
                  {file.type === 'image' ? (
                    <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-[12px] truncate max-w-[180px]">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-[#737A8C]">
                      {file.ocrAccuracy ? `✓ ${file.ocrAccuracy} OCR accuracy` : `${file.size || 'Attached'} • ${file.pages || 'Document'}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Message Bubble */}
          <div
            className={`rounded-[18px] rounded-tr-[4px] px-4 py-3 text-[14px] sm:text-[15px] leading-relaxed shadow-md border ${
              isNightMode
                ? 'bg-[#141724] border-[#22273B] text-[#FCFCFC]'
                : 'bg-indigo-600 border-indigo-700 text-white'
            }`}
          >
            {children}
          </div>

          {/* Timestamp with double check mark */}
          {timestamp && (
            <div className="text-[10px] text-[#737A8C] text-right pr-2 flex items-center justify-end gap-1">
              <span>{timestamp}</span>
              <CheckCheck className={`w-3 h-3 ${isNightMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant Bubble
  return (
    <div className="flex items-start gap-3 w-full group animate-in fade-in">
      {/* Bot Icon */}
      <div
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#344CE4] to-[#14AC8C] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-500/20"
        aria-hidden="true"
      >
        <Bot className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 max-w-[94%] sm:max-w-[88%] space-y-2">
        <div
          className={`rounded-[18px] rounded-tl-[4px] px-4 py-3.5 text-[14px] sm:text-[15px] leading-relaxed shadow-sm border ${
            isNightMode
              ? 'bg-[#111420] border-[#1D2235] text-[#FCFCFC]'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {children}
        </div>

        {/* Action chips */}
        {actionChips && actionChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {actionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={chip.onClick}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all border cursor-pointer ${
                  isNightMode
                    ? 'text-indigo-300 bg-[#141828] hover:bg-[#1A2035] border-[#1E253E] hover:border-indigo-500/40'
                    : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {timestamp && (
          <div className="text-[10px] text-[#737A8C] pl-1">
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};
