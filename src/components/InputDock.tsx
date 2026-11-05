import React, { useRef, useEffect } from 'react';
import {
  Paperclip,
  ArrowUp,
  Loader2,
  Image as ImageIcon,
  FileText,
  X,
  FileCode,
} from 'lucide-react';

interface InputDockProps {
  value: string;
  onChange: (val: string) => void;
  attachedFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onSend: () => void;
  onOpenCamera: () => void;
  onSelectSuggestionPrompt?: (prompt: string) => void;
  isParsingFile?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  placeholder?: string;
  selectedModel?: string;
  isNightMode?: boolean;
}

export const InputDock: React.FC<InputDockProps> = ({
  value,
  onChange,
  attachedFiles = [],
  onAddFiles,
  onRemoveFile,
  onSend,
  onOpenCamera,
  onSelectSuggestionPrompt,
  isParsingFile = false,
  disabled = false,
  disabledReason,
  placeholder = 'Paste your notes, ask a follow-up question, or attach files…',
  selectedModel = 'Gemini 2.5',
  isNightMode = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 130)}px`;
    }
  }, [value]);

  const canSend = (value.trim().length > 0 || attachedFiles.length > 0) && !disabled && !isParsingFile;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSend();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddFiles(Array.from(files));
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && !isParsingFile) {
      fileInputRef.current?.click();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
      return <ImageIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />;
    }
    if (['txt', 'md'].includes(ext || '')) {
      return <FileCode className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />;
    }
    return <FileText className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />;
  };

  const suggestions = [
    {
      label: 'Suggest 5 tough exam questions',
      prompt: 'Based on these notes, generate 5 challenging, high-difficulty exam questions with model answers.',
    },
    {
      label: "Explain like I'm 10",
      prompt: 'Explain the core biological/technical mechanism in these notes in intuitive terms using everyday analogies.',
    },
    {
      label: '1-Page Cheat Sheet',
      prompt: 'Synthesize these notes into an ultra-dense 1-page exam cheat sheet with key formulas, tables, and definitions.',
    },
    {
      label: 'Roman Urdu summary',
      prompt: 'In notes ka khulasa aasan Roman Urdu me samjha dain taake midterm exam ki teyari ho sakay.',
    },
  ];

  return (
    <footer
      className={`w-full px-2 sm:px-6 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0 select-none border-t ${
        isNightMode
          ? 'bg-[#0B0B0C] border-[#EDEDED]/10'
          : 'bg-[#FAFAF7] border-[#1A1A1A]/10'
      }`}
    >
      <div className="max-w-[740px] mx-auto w-full space-y-2.5">
        {/* Suggestion Row */}
        <div className="flex items-center overflow-x-auto whitespace-nowrap gap-2 hide-scrollbar text-[12px]">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (onSelectSuggestionPrompt) {
                  onSelectSuggestionPrompt(s.prompt);
                } else {
                  onChange(s.prompt);
                }
              }}
              className={`px-2.5 py-1 rounded-[6px] border transition-colors duration-150 shrink-0 cursor-pointer ${
                isNightMode
                  ? 'bg-[#141416] hover:bg-[#1C1C1F] text-[#8A8A8A] hover:text-[#EDEDED] border-[#EDEDED]/10'
                  : 'bg-[#F2F1EC] hover:bg-[#E8E6DF] text-[#6B6B6B] hover:text-[#1A1A1A] border-[#1A1A1A]/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input Container */}
        <div
          className={`w-full rounded-[6px] border p-2.5 transition-colors duration-150 ${
            isNightMode
              ? 'bg-[#141416] border-[#EDEDED]/15 focus-within:border-[#2D4A3E]'
              : 'bg-[#F2F1EC] border-[#1A1A1A]/15 focus-within:border-[#2D4A3E]'
          } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div
              className={`flex flex-wrap items-center gap-2 pb-2 mb-2 border-b ${
                isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
              }`}
            >
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-[12px] ${
                    isNightMode
                      ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#EDEDED]'
                      : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#1A1A1A]'
                  }`}
                >
                  {getFileIcon(file.name)}
                  <span className="font-medium truncate max-w-[160px] sm:max-w-[200px]">
                    {file.name}
                  </span>
                  <span className={isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'}>
                    ({formatSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(idx)}
                    title="Remove file"
                    className={`p-0.5 rounded-[4px] cursor-pointer ml-0.5 transition-colors duration-150 ${
                      isNightMode
                        ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                        : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled || isParsingFile}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isParsingFile
                ? 'Extracting notes from attached document…'
                : attachedFiles.length > 0
                ? 'Add notes or instructions for these files (optional)…'
                : disabledReason || placeholder
            }
            className={`w-full bg-transparent text-[15px] resize-none outline-none px-1.5 py-1 max-h-[130px] leading-[1.6] ${
              isNightMode
                ? 'text-[#EDEDED] placeholder-[#8A8A8A]'
                : 'text-[#1A1A1A] placeholder-[#6B6B6B]'
            }`}
          />

          {/* Bottom Dock Control Bar */}
          <div
            className={`flex items-center justify-between pt-2 gap-2 border-t ${
              isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
            }`}
          >
            {/* Left Action Buttons: Paperclip + Camera */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={disabled || isParsingFile}
                title="Attach study files (.pdf, .docx, .txt, .md)"
                aria-label="Attach study files"
                className={`p-1.5 rounded-[6px] flex items-center justify-center transition-colors duration-150 cursor-pointer ${
                  isNightMode
                    ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
                }`}
              >
                {isParsingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Paperclip className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>

              <button
                type="button"
                onClick={onOpenCamera}
                disabled={disabled || isParsingFile}
                title="Scan handwritten notes"
                aria-label="Scan handwritten notes"
                className={`p-1.5 rounded-[6px] flex items-center justify-center transition-colors duration-150 cursor-pointer ${
                  isNightMode
                    ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
                }`}
              >
                <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />

            {/* Right: Model Label + Send Button */}
            <div className="flex items-center gap-3">
              <span
                className={`hidden sm:inline text-[12px] ${
                  isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                }`}
              >
                {selectedModel}
              </span>

              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                aria-label="Send message"
                className={`w-8 h-8 rounded-[6px] flex items-center justify-center transition-colors duration-150 ${
                  canSend
                    ? 'bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] cursor-pointer'
                    : isNightMode
                    ? 'bg-[#1C1C1F] text-[#8A8A8A]/50 cursor-not-allowed'
                    : 'bg-[#E8E6DF] text-[#6B6B6B]/50 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
