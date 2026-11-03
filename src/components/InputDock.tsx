import React, { useRef, useEffect } from 'react';
import { Camera, Paperclip, Send, Loader2 } from 'lucide-react';

interface InputDockProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onOpenCamera: () => void;
  onFileUpload: (file: File) => void;
  isParsingFile?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  placeholder?: string;
}

export const InputDock: React.FC<InputDockProps> = ({
  value,
  onChange,
  onSend,
  onOpenCamera,
  onFileUpload,
  isParsingFile = false,
  disabled = false,
  disabledReason,
  placeholder = 'Paste your notes or ask a question…',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap at ~5 rows (~120px)
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 40), 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      // Reset input value so re-uploading the same file works
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && !isParsingFile) {
      fileInputRef.current?.click();
    }
  };

  return (
    <footer className="w-full bg-[#141414] border-t border-[#1F1F1F] p-3 sm:p-4 shrink-0 transition-opacity">
      <div className="max-w-[720px] mx-auto w-full">
        {disabled && disabledReason && (
          <div className="text-[11px] text-[#A1A1A1] text-center mb-1.5 font-medium">
            {disabledReason}
          </div>
        )}

        <div
          className={`rounded-[16px] bg-[#1F1F1F] border border-[#2A2A2A] p-1.5 sm:p-2 flex items-end gap-1.5 sm:gap-2 transition-all ${
            disabled ? 'opacity-40 pointer-events-none' : 'focus-within:border-[#14AC8C]/60'
          }`}
        >
          {/* Camera button */}
          <button
            type="button"
            onClick={onOpenCamera}
            disabled={disabled || isParsingFile}
            aria-label="Upload handwritten notes via camera"
            title="Scan handwritten notes"
            className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[#A1A1A1] hover:text-[#FCFCFC] hover:bg-[#282828] active:scale-95 transition-all shrink-0 cursor-pointer min-h-[40px] min-w-[40px]"
          >
            <Camera className="w-5 h-5 text-[#14AC8C]" />
          </button>

          {/* File Upload button (PDF, DOCX, TXT, MD) */}
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={disabled || isParsingFile}
            aria-label="Upload study notes file (PDF, DOCX, TXT, MD)"
            title="Upload notes file (.pdf, .docx, .txt, .md)"
            className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[#A1A1A1] hover:text-[#FCFCFC] hover:bg-[#282828] active:scale-95 transition-all shrink-0 cursor-pointer min-h-[40px] min-w-[40px] relative"
          >
            {isParsingFile ? (
              <Loader2 className="w-5 h-5 text-[#14AC8C] animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5 text-[#14AC8C]" />
            )}
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />

          {/* Auto-growing Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled || isParsingFile}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isParsingFile
                ? 'Extracting notes from file…'
                : placeholder
            }
            className="flex-1 bg-transparent text-[#FCFCFC] placeholder-[#A1A1A1]/60 text-[14px] sm:text-[15px] resize-none outline-none py-2 px-1 max-h-[120px] leading-relaxed"
          />

          {/* Send button */}
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !value.trim() || isParsingFile}
            aria-label="Send message"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 min-h-[40px] min-w-[40px] ${
              value.trim() && !disabled && !isParsingFile
                ? 'bg-[#14AC8C] text-[#111111] hover:bg-[#129a7d] active:scale-95 shadow-md cursor-pointer'
                : 'bg-[#2A2A2A] text-[#666666] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
