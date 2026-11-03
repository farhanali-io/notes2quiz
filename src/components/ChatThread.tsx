import React, { useRef, useEffect } from 'react';
import { Bubble } from './Bubble';
import { ThinkingDots } from './ThinkingDots';
import { FeatureGrid } from './FeatureGrid';
import { StudyPack } from './StudyPack';
import { StudyPackData } from '../data/mockPacks';
import { Calendar, SkipForward, ArrowRight, Sparkles } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text?: string;
  timestamp?: string;
  isThinking?: boolean;
  isStudyPack?: boolean;
  actionChips?: { label: string; onClick: () => void }[];
}

interface ChatThreadProps {
  step: number;
  messages: ChatMessage[];
  studyPackData: StudyPackData | null;
  selectedFeatures: string[];
  examDate: string;
  language: 'English' | 'Roman Urdu';
  onExamDateChange: (date: string) => void;
  onSubmitExamDate: () => void;
  onSkipExamDate: () => void;
  onSelectLanguage: (lang: 'English' | 'Roman Urdu') => void;
  onToggleFeature: (id: string) => void;
  onSelectAllFeatures: () => void;
  onGeneratePack: () => void;
  onLoadSampleNotes: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  step,
  messages,
  studyPackData,
  selectedFeatures,
  examDate,
  language,
  onExamDateChange,
  onSubmitExamDate,
  onSkipExamDate,
  onSelectLanguage,
  onToggleFeature,
  onSelectAllFeatures,
  onGeneratePack,
  onLoadSampleNotes,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  return (
    <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
      <div className="max-w-[720px] mx-auto w-full space-y-4">
        {/* Render standard message history */}
        {messages.map((msg) => {
          if (msg.isThinking) {
            return (
              <Bubble key={msg.id} sender="assistant">
                <ThinkingDots />
              </Bubble>
            );
          }

          if (msg.isStudyPack && studyPackData) {
            return (
              <div key={msg.id} className="space-y-3 w-full">
                <Bubble sender="assistant">
                  Here is your generated study pack! Review each module below, practice the interactive questions, or export your pack anytime using the download bar below.
                </Bubble>
                <StudyPack
                  data={studyPackData}
                  selectedFeatures={selectedFeatures}
                  examDate={examDate}
                />
              </div>
            );
          }

          return (
            <Bubble
              key={msg.id}
              sender={msg.sender}
              timestamp={msg.timestamp}
              actionChips={msg.actionChips}
            >
              {msg.text}
            </Bubble>
          );
        })}

        {/* STEP 0: Optional quick sample note suggestion */}
        {step === 0 && (
          <div className="pt-2 pl-10">
            <button
              type="button"
              onClick={onLoadSampleNotes}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-[#14AC8C] hover:text-[#17c29e] border border-[#14AC8C]/20 hover:border-[#14AC8C]/40 text-[12px] font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load sample note: Cell Division & Mitosis</span>
            </button>
          </div>
        )}

        {/* STEP 1: Exam Date Prompt Actions */}
        {step === 1 && (
          <div className="pl-10 space-y-3 pt-1">
            <div className="p-4 rounded-[14px] bg-[#141414] border border-[#1F1F1F] space-y-3 max-w-[420px]">
              <label
                htmlFor="exam-date-input"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A1]"
              >
                Set Exam Date (Optional)
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="w-4 h-4 text-[#14AC8C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="exam-date-input"
                    type="date"
                    value={examDate}
                    onChange={(e) => onExamDateChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#1F1F1F] border border-[#2D2D2D] rounded-[8px] text-[14px] text-[#FCFCFC] focus:border-[#14AC8C] outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={onSubmitExamDate}
                  disabled={!examDate}
                  aria-label="Confirm exam date"
                  className={`h-9 px-3 rounded-[8px] font-medium text-[13px] flex items-center gap-1.5 transition-all ${
                    examDate
                      ? 'bg-[#14AC8C] text-[#111111] hover:bg-[#129a7d] cursor-pointer'
                      : 'bg-[#222222] text-[#666666] cursor-not-allowed'
                  }`}
                >
                  <span>Set</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#1F1F1F]">
                <span className="text-[12px] text-[#A1A1A1]">
                  Don't have a date yet?
                </span>
                <button
                  type="button"
                  onClick={onSkipExamDate}
                  className="px-3 py-1 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-[#FCFCFC] text-[12px] font-medium border border-[#2D2D2D] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5 text-[#A1A1A1]" />
                  <span>Skip</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Language Preference Actions */}
        {step === 2 && (
          <div className="pl-10 space-y-2 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A1] block">
              Choose language
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectLanguage('English')}
                className="flex-1 min-w-[140px] max-w-[200px] h-12 rounded-full bg-[#141414] hover:bg-[#1F1F1F] border border-[#1F1F1F] hover:border-[#14AC8C] text-[#FCFCFC] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-[0_0_15px_-4px_rgba(20,172,140,0.3)]"
              >
                <span>English</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectLanguage('Roman Urdu')}
                className="flex-1 min-w-[140px] max-w-[200px] h-12 rounded-full bg-[#141414] hover:bg-[#1F1F1F] border border-[#1F1F1F] hover:border-[#14AC8C] text-[#FCFCFC] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-[0_0_15px_-4px_rgba(20,172,140,0.3)]"
              >
                <span>Roman Urdu</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Multi-select Feature Grid */}
        {step === 3 && (
          <div className="pl-10 pt-1">
            <FeatureGrid
              selectedFeatures={selectedFeatures}
              onToggleFeature={onToggleFeature}
              onSelectAll={onSelectAllFeatures}
              onGenerate={onGeneratePack}
            />
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </main>
  );
};
