import React, { useRef, useEffect } from 'react';
import {
  Camera,
  Paperclip,
  ArrowUp,
  Loader2,
  Image as ImageIcon,
  Zap,
  Sparkles,
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

  // Auto-grow textarea height
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

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
      return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (['txt', 'md'].includes(ext || '')) {
      return <FileCode className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
  };

  // Suggestions
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
      label: '🇵🇰 Roman Urdu summary',
      prompt: 'In notes ka khulasa aasan Roman Urdu me samjha dain taake midterm exam ki teyari ho sakay.',
    },
  ];

  return (
    <footer
      className={`w-full p-3 sm:p-4 shrink-0 transition-opacity select-none ${
        isNightMode
          ? 'bg-gradient-to-t from-[#08090F] via-[#090B12] to-transparent'
          : 'bg-gradient-to-t from-slate-100 via-slate-50 to-transparent'
      }`}
    >
      <div className="max-w-[760px] mx-auto w-full space-y-2">
        {/* Suggestion Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all shrink-0 cursor-pointer active:scale-95 shadow-xs ${
                isNightMode
                  ? 'bg-[#121626] hover:bg-[#181E32] text-[#A1A1A1] hover:text-[#FCFCFC] border-[#1E253E]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Input Dock Container */}
        <div
          className={`rounded-[16px] border p-2 sm:p-2.5 transition-all shadow-xl ${
            isNightMode
              ? 'bg-[#101320] border-[#1E253D]'
              : 'bg-white border-slate-300 shadow-slate-200'
          } ${
            disabled
              ? 'opacity-60 pointer-events-none'
              : 'focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30'
          }`}
        >
          {/* Attached Files Stays in Input Bar (User can add text or more files before sending) */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-2 mb-2 border-b border-indigo-500/20">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border text-[11px] animate-in fade-in ${
                    isNightMode
                      ? 'bg-[#161B2E] border-[#222B48] text-[#E2E8F0]'
                      : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  {getFileIcon(file.name)}
                  <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-[#788195]">
                    ({formatSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(idx)}
                    title="Remove file"
                    className="p-0.5 rounded hover:bg-black/20 text-[#A1A1A1] hover:text-rose-400 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <span className="text-[10px] text-indigo-400 font-mono">
                {attachedFiles.length} {attachedFiles.length === 1 ? 'file' : 'files'} attached • Add notes or click Send
              </span>
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
                ? 'Add any additional notes or instructions for these files (optional)…'
                : disabledReason || placeholder
            }
            className={`w-full bg-transparent text-[14px] resize-none outline-none px-2 py-1.5 max-h-[130px] leading-relaxed ${
              isNightMode
                ? 'text-[#FCFCFC] placeholder-[#737A8C]'
                : 'text-slate-900 placeholder-slate-400'
            }`}
          />

          {/* Bottom Dock Control Bar */}
          <div
            className={`flex items-center justify-between pt-1 gap-2 border-t ${
              isNightMode ? 'border-[#161B2B]' : 'border-slate-100'
            }`}
          >
            {/* Left Action Buttons: Paperclip + Camera (Microphone removed as requested) */}
            <div className="flex items-center gap-1">
              {/* Paperclip (Multi-file support) */}
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={disabled || isParsingFile}
                title="Attach study files (.pdf, .docx, .txt, .md)"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isNightMode
                    ? 'text-[#A1A1A1] hover:text-[#FCFCFC] hover:bg-[#181E30]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isParsingFile ? (
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </button>

              {/* Photo / Camera */}
              <button
                type="button"
                onClick={onOpenCamera}
                disabled={disabled || isParsingFile}
                title="Scan handwritten notes / upload photo"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isNightMode
                    ? 'text-[#A1A1A1] hover:text-[#FCFCFC] hover:bg-[#181E30]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-[#14AC8C]" />
              </button>
            </div>

            {/* Hidden File Input with multiple attribute */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />

            {/* Right: Model Badge + Send Button */}
            <div className="flex items-center gap-2">
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                  isNightMode
                    ? 'bg-[#151929] border-[#202740] text-indigo-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
              >
                <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                <span>{selectedModel}</span>
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                aria-label="Send message"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  canSend
                    ? 'bg-gradient-to-tr from-[#344CE4] to-[#6366F1] text-white hover:opacity-95 shadow-md shadow-indigo-950/50 cursor-pointer active:scale-95'
                    : isNightMode
                    ? 'bg-[#181E30] text-[#525866] cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Academic synthesis disclaimer */}
        <p
          className={`text-[10px] text-center tracking-tight ${
            isNightMode ? 'text-[#525866]' : 'text-slate-500'
          }`}
        >
          Notes2Quiz academic synthesis • Citations verified against university textbooks & syllabus
        </p>
      </div>
    </footer>
  );
};
