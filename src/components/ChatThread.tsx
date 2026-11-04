import React, { useRef, useEffect } from 'react';
import { Bubble, FileAttachment } from './Bubble';
import { ThinkingDots } from './ThinkingDots';
import { StudyStrategyCard } from './StudyStrategyCard';
import { StudyPackViewer } from './StudyPackViewer';
import { StudyPackData } from '../types/studyPack';
import { Sparkles, BookOpen, Terminal, Scale } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text?: string;
  timestamp?: string;
  isThinking?: boolean;
  isStudyPack?: boolean;
  actionChips?: { label: string; onClick: () => void }[];
  attachments?: FileAttachment[];
}

interface ChatThreadProps {
  step: number;
  messages: ChatMessage[];
  studyPackData: StudyPackData | null;
  selectedFeatures: string[];
  examDate: string;
  language: 'English' | 'Roman Urdu';
  sessionTitle: string;
  notesWordCount?: number;
  extractedThemes?: string[];
  onExamDateChange: (date: string) => void;
  onSubmitExamDate: () => void;
  onSkipExamDate: () => void;
  onSelectLanguage: (lang: 'English' | 'Roman Urdu') => void;
  onToggleFeature: (id: string) => void;
  onSelectAllFeatures: () => void;
  onGeneratePack: () => void;
  onLoadSampleNotes: (sampleType?: 'bio' | 'cs' | 'pak') => void;
  onStartTimedQuiz: () => void;
  isGenerating?: boolean;
  isNightMode?: boolean;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  step,
  messages,
  studyPackData,
  selectedFeatures,
  examDate,
  language,
  sessionTitle,
  notesWordCount = 380,
  extractedThemes,
  onExamDateChange,
  onSubmitExamDate,
  onSkipExamDate,
  onSelectLanguage,
  onToggleFeature,
  onSelectAllFeatures,
  onGeneratePack,
  onLoadSampleNotes,
  onStartTimedQuiz,
  isGenerating = false,
  isNightMode = true,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step, isGenerating]);

  const hasOnlyGreeting = messages.length === 1 && messages[0].sender === 'assistant';

  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 scroll-smooth">
      <div className="max-w-[760px] mx-auto w-full space-y-5">
        {/* Render standard message history */}
        {messages.map((msg) => {
          if (msg.isThinking) {
            return (
              <Bubble key={msg.id} sender="assistant" isNightMode={isNightMode}>
                <div className="flex items-center gap-3">
                  <ThinkingDots />
                  <span className="text-[12px] text-indigo-400 font-medium">
                    Generating academic study materials via Gemini 2.5…
                  </span>
                </div>
              </Bubble>
            );
          }

          if (msg.isStudyPack && studyPackData) {
            return (
              <div key={msg.id} className="space-y-4 w-full animate-in fade-in">
                <StudyPackViewer
                  data={studyPackData}
                  selectedFeatures={selectedFeatures}
                  sessionTitle={sessionTitle}
                  examDate={examDate}
                  language={language}
                  onStartTimedQuiz={onStartTimedQuiz}
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
              attachments={msg.attachments}
              isNightMode={isNightMode}
            >
              {msg.text}
            </Bubble>
          );
        })}

        {/* STEP 0: Show quick sample starter buttons when only the greeting is present */}
        {(step === 0 || hasOnlyGreeting) && (
          <div className="pt-2 pl-11 space-y-2">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider block ${
                isNightMode ? 'text-[#737A8C]' : 'text-slate-500'
              }`}
            >
              Or test with university course sample notes:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onLoadSampleNotes('bio')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all active:scale-95 cursor-pointer shadow-xs ${
                  isNightMode
                    ? 'bg-[#121626] hover:bg-[#181E32] text-indigo-300 hover:text-white border-indigo-500/30'
                    : 'bg-white hover:bg-slate-100 text-indigo-700 border-indigo-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>🧬 BIO 301 Cellular Respiration</span>
              </button>

              <button
                type="button"
                onClick={() => onLoadSampleNotes('cs')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all active:scale-95 cursor-pointer shadow-xs ${
                  isNightMode
                    ? 'bg-[#121626] hover:bg-[#181E32] text-indigo-300 hover:text-white border-indigo-500/30'
                    : 'bg-white hover:bg-slate-100 text-indigo-700 border-indigo-200'
                }`}
              >
                <Terminal className="w-3 h-3 text-indigo-500" />
                <span>💻 CS 201 Data Structures & Algorithms</span>
              </button>

              <button
                type="button"
                onClick={() => onLoadSampleNotes('pak')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all active:scale-95 cursor-pointer shadow-xs ${
                  isNightMode
                    ? 'bg-[#121626] hover:bg-[#181E32] text-indigo-300 hover:text-white border-indigo-500/30'
                    : 'bg-white hover:bg-slate-100 text-indigo-700 border-indigo-200'
                }`}
              >
                <Scale className="w-3 h-3 text-amber-500" />
                <span>🏛️ PAK 101 Pakistan Constitutional History</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1-3: Show Modern Selectable Study Options Card (What to create) */}
        {(step === 1 || step === 2 || step === 3) && (
          <div className="w-full pt-1">
            <StudyStrategyCard
              notesWordCount={notesWordCount}
              extractedThemes={extractedThemes}
              selectedFeatures={selectedFeatures}
              onToggleFeature={onToggleFeature}
              onSelectAllFeatures={onSelectAllFeatures}
              language={language}
              onSelectLanguage={onSelectLanguage}
              examDate={examDate}
              onExamDateChange={onExamDateChange}
              onGenerate={onGeneratePack}
              isGenerating={isGenerating}
            />
          </div>
        )}

        <div ref={bottomRef} className="h-6" />
      </div>
    </main>
  );
};
