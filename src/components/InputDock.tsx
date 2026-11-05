import React, { useRef, useEffect, useState } from 'react';
import {
  Paperclip,
  ArrowUp,
  Loader2,
  Image as ImageIcon,
  FileText,
  X,
  FileCode,
  Upload,
  AlertCircle,
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
  onValidationError?: (message: string) => void;
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
  onValidationError,
  isParsingFile = false,
  disabled = false,
  disabledReason,
  placeholder = 'Paste your notes, ask a follow-up question, or attach files…',
  selectedModel = 'Gemini 2.5',
  isNightMode = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadBoxOpen, setIsUploadBoxOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md'];

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

  const validateAndAddFiles = (files: File[]) => {
    const validFiles: File[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        const msg = 'Invalid file type. Please upload a PDF, DOCX, TXT, or MD file.';
        setUploadError(msg);
        onValidationError?.(msg);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        const msg =
          'File is too large. Please upload a file smaller than 5MB to ensure smooth AI processing.';
        setUploadError(msg);
        onValidationError?.(msg);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setUploadError(null);
      onAddFiles(validFiles);
      setIsUploadBoxOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndAddFiles(Array.from(files));
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && !isParsingFile) {
      fileInputRef.current?.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isParsingFile) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      validateAndAddFiles(files);
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
            className={`relative flex items-center justify-between pt-2 gap-2 border-t ${
              isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
            }`}
          >
            {/* Floating File Upload Box */}
            {isUploadBoxOpen && (
              <div
                role="dialog"
                aria-label="Upload study files"
                className={`fixed inset-x-0 bottom-24 mx-auto w-[90%] max-w-[400px] sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:mb-2 sm:w-[380px] z-40 rounded-[6px] border p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] space-y-3 ${
                  isNightMode
                    ? 'bg-[#141416] border-[#EDEDED]/15 text-[#EDEDED]'
                    : 'bg-[#F2F1EC] border-[#1A1A1A]/15 text-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">Upload study notes</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadBoxOpen(false);
                      setUploadError(null);
                    }}
                    aria-label="Close upload box"
                    className={`p-1 rounded-[4px] cursor-pointer transition-colors duration-150 ${
                      isNightMode
                        ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                        : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
                    }`}
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Drag and Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`rounded-[6px] border border-dashed p-4 text-center space-y-3 transition-colors duration-150 ${
                    isDragging
                      ? 'border-[#2D4A3E] bg-[#2D4A3E]/10'
                      : isNightMode
                      ? 'border-[#EDEDED]/15 bg-[#0B0B0C]'
                      : 'border-[#1A1A1A]/15 bg-[#FAFAF7]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload
                      className={`w-5 h-5 ${
                        isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                      }`}
                      strokeWidth={1.5}
                    />
                    <p className="text-[13px] font-medium">Drag and drop files here</p>
                  </div>

                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-[6px] bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] text-[13px] font-medium transition-colors duration-150 cursor-pointer"
                  >
                    Select from device
                  </button>

                  {/* Helper Text */}
                  <div
                    className={`text-sm space-y-0.5 pt-1 ${
                      isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                    }`}
                  >
                    <p>Accepted formats: PDF, DOCX, TXT, MD</p>
                    <p>Max file size: 5MB</p>
                  </div>
                </div>

                {/* Inline Validation Error */}
                {uploadError && (
                  <div
                    role="alert"
                    className={`flex items-start gap-2 p-2.5 rounded-[6px] border text-[12px] leading-snug ${
                      isNightMode
                        ? 'bg-[#2A1717] border-[#7F2F2F] text-[#EDEDED]'
                        : 'bg-[#F5E6E6] border-[#B85C5C] text-[#1A1A1A]'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Left Action Buttons: Paperclip + Camera */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setUploadError(null);
                  setIsUploadBoxOpen((p) => !p);
                }}
                disabled={disabled || isParsingFile}
                title="Attach study files (.pdf, .docx, .txt, .md)"
                aria-label="Attach study files"
                aria-expanded={isUploadBoxOpen}
                className={`p-1.5 rounded-[6px] flex items-center justify-center transition-colors duration-150 cursor-pointer ${
                  isUploadBoxOpen
                    ? 'bg-[#2D4A3E] text-[#EDEDED]'
                    : isNightMode
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
              accept=".pdf,.docx,.txt,.md"
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
