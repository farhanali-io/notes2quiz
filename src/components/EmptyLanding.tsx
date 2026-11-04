import React, { useRef, useState } from 'react';
import {
  GraduationCap,
  Paperclip,
  Camera,
  ArrowUp,
  Sparkles,
  Loader2,
  FileText,
  Layers,
  CheckCircle2,
  Calendar,
  EyeOff,
  BookOpen,
} from 'lucide-react';
import {
  SAMPLE_NOTES,
  SAMPLE_CS_NOTES,
  SAMPLE_PAK_NOTES,
} from '../types/studyPack';

interface EmptyLandingProps {
  studentName?: string;
  language: 'English' | 'Roman Urdu';
  onSelectLanguage: (lang: 'English' | 'Roman Urdu') => void;
  onSubmitNotes: (notes: string, title?: string) => void;
  onFileUpload: (file: File) => void;
  onOpenCamera: () => void;
  isParsingFile?: boolean;
}

export const EmptyLanding: React.FC<EmptyLandingProps> = ({
  studentName = 'Farhan Ali',
  language,
  onSelectLanguage,
  onSubmitNotes,
  onFileUpload,
  onOpenCamera,
  isParsingFile = false,
}) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isParsingFile) {
        onSubmitNotes(inputText.trim());
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  const handleSend = () => {
    if (inputText.trim() && !isParsingFile) {
      onSubmitNotes(inputText.trim());
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-[800px] mx-auto w-full select-none animate-in fade-in duration-300">
      {/* Top Claude-style Hero Header */}
      <div className="text-center space-y-3 mb-7 max-w-[620px]">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#344CE4] via-[#4F46E5] to-[#14AC8C] text-white shadow-xl shadow-indigo-500/20 mb-1">
          <GraduationCap className="w-6 h-6 text-white stroke-[2.2]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#FCFCFC]">
          {getGreeting()}, {studentName.split(' ')[0]}
        </h1>

        <p className="text-[14px] sm:text-[15px] text-[#A1A1A1] leading-relaxed">
          What would you like to study today? Drop your lecture slides, paste text, or upload photos of handwritten notes.
        </p>
      </div>

      {/* Central Claude-style Prompt & Upload Card */}
      <div className="w-full rounded-[20px] bg-[#101320] border border-[#1E253D] p-3.5 sm:p-4 shadow-2xl transition-all focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <textarea
          rows={3}
          value={inputText}
          disabled={isParsingFile}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isParsingFile
              ? 'Reading and extracting document text…'
              : 'Paste lecture notes, syllabus concepts, or paste textbook text here…'
          }
          className="w-full bg-transparent text-[#FCFCFC] placeholder-[#636C82] text-[15px] resize-none outline-none leading-relaxed min-h-[80px]"
        />

        {/* Card Controls Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#181D2E] gap-2">
          {/* Left tools: File attach + Camera + Language */}
          <div className="flex items-center gap-2">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsingFile}
              title="Upload PDF, DOCX, TXT, or MD"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#161B2B] hover:bg-[#1E253A] text-[#A1A1A1] hover:text-white border border-[#222940] transition-colors cursor-pointer text-[12px] font-medium"
            >
              {isParsingFile ? (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4 text-indigo-400" />
              )}
              <span>Upload Document</span>
            </button>

            {/* Camera Button */}
            <button
              type="button"
              onClick={onOpenCamera}
              disabled={isParsingFile}
              title="Scan handwritten notes / photo"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#161B2B] hover:bg-[#1E253A] text-[#A1A1A1] hover:text-white border border-[#222940] transition-colors cursor-pointer text-[12px] font-medium"
            >
              <Camera className="w-4 h-4 text-[#14AC8C]" />
              <span className="hidden sm:inline">Handwritten Notes</span>
            </button>

            {/* Language Segmented Toggle */}
            <div className="hidden sm:inline-flex items-center rounded-lg bg-[#0C0E17] border border-[#1C2236] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => onSelectLanguage('English')}
                className={`px-2.5 py-1 rounded-[6px] font-medium transition-all cursor-pointer ${
                  language === 'English'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-[#858D9F] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('Roman Urdu')}
                className={`px-2.5 py-1 rounded-[6px] font-medium transition-all cursor-pointer ${
                  language === 'Roman Urdu'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#858D9F] hover:text-white'
                }`}
                title="Roman Urdu study mode"
              >
                Roman Urdu
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />

          {/* Submit Arrow Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isParsingFile}
            aria-label="Submit notes"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              inputText.trim() && !isParsingFile
                ? 'bg-gradient-to-tr from-[#344CE4] via-[#4F46E5] to-[#14AC8C] text-white hover:opacity-95 shadow-md shadow-indigo-950/60 cursor-pointer active:scale-95'
                : 'bg-[#181D2E] text-[#4F576A] cursor-not-allowed'
            }`}
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Quick Test Starter Pills (Instant 1-Click Samples) */}
      <div className="w-full mt-6 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-[#737A8C] px-1">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Or try a university course sample:</span>
          </span>
          <span className="hidden sm:inline">Click to load instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onSubmitNotes(SAMPLE_NOTES, 'BIO 301: Cellular Respiration & ATP')}
            className="p-3 rounded-[12px] bg-[#121524] hover:bg-[#181D30] border border-[#1D243A] hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold mb-1">
              <span>BIO 301</span>
              <span className="text-[10px] font-mono text-[#737A8C] group-hover:text-white">Sample</span>
            </div>
            <div className="text-[13px] font-medium text-[#FCFCFC] truncate">
              Cellular Respiration & ATP
            </div>
            <div className="text-[11px] text-[#858D9F] mt-0.5 truncate">
              Glycolysis, Krebs Cycle & Chemiosmosis
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSubmitNotes(SAMPLE_CS_NOTES, 'CS 201: Data Structures & Algorithms')}
            className="p-3 rounded-[12px] bg-[#121524] hover:bg-[#181D30] border border-[#1D243A] hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] text-indigo-400 font-semibold mb-1">
              <span>CS 201</span>
              <span className="text-[10px] font-mono text-[#737A8C] group-hover:text-white">Sample</span>
            </div>
            <div className="text-[13px] font-medium text-[#FCFCFC] truncate">
              Data Structures & Algorithms
            </div>
            <div className="text-[11px] text-[#858D9F] mt-0.5 truncate">
              BST, Graphs, Dijkstra & DP
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSubmitNotes(SAMPLE_PAK_NOTES, 'PAK 101: Pakistan Constitutional History')}
            className="p-3 rounded-[12px] bg-[#121524] hover:bg-[#181D30] border border-[#1D243A] hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold mb-1">
              <span>PAK 101</span>
              <span className="text-[10px] font-mono text-[#737A8C] group-hover:text-white">Sample</span>
            </div>
            <div className="text-[13px] font-medium text-[#FCFCFC] truncate">
              Constitutional History
            </div>
            <div className="text-[11px] text-[#858D9F] mt-0.5 truncate">
              14 Points, 1973 Constitution & 18th Amend
            </div>
          </button>
        </div>
      </div>

      {/* Feature capabilities footer badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#636C82]">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          University Exam MCQs
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          Short & Long Questions
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          Spaced Flashcards
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          Day-by-Day Revision Plan
        </span>
      </div>
    </div>
  );
};
