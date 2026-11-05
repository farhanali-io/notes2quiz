import React, { useRef, useEffect } from 'react';
import { Bubble, FileAttachment } from './Bubble';
import { ThinkingDots } from './ThinkingDots';
import { StudyStrategyCard } from './StudyStrategyCard';
import { StudyPackViewer } from './StudyPackViewer';
import { StudyPackData } from '../types/studyPack';
import { Dna, Terminal, Scale } from 'lucide-react';

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
  onSelectLanguage,
  onToggleFeature,
  onSelectAllFeatures,
  onGeneratePack,
  onLoadSampleNotes,
  onStartTimedQuiz,
  isGenerating = false,
  isNightMode = true,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step, isGenerating]);

  const hasOnlyGreeting = messages.length === 1 && messages[0].sender === 'assistant';
  const showThinking = isGenerating || messages.some((m) => m.isThinking);

  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-[740px] mx-auto w-full space-y-6">
        {/* Message history */}
        {messages
          .filter((msg) => !msg.isThinking)
          .map((msg) => {
            if (msg.isStudyPack && studyPackData) {
              return (
                <div key={msg.id} className="space-y-4 w-full">
                  <StudyPackViewer
                    data={studyPackData}
                    selectedFeatures={selectedFeatures}
                    sessionTitle={sessionTitle}
                    examDate={examDate}
                    language={language}
                    onStartTimedQuiz={onStartTimedQuiz}
                    isNightMode={isNightMode}
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

        {/* Quick sample starter buttons when only the greeting is present */}
        {(step === 0 || hasOnlyGreeting) && !showThinking && (
          <div className="pt-1 pl-10 space-y-2">
            <span
              className={`text-[12px] font-medium block ${
                isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
              }`}
            >
              Sample course notes
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onLoadSampleNotes('bio')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] border text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  isNightMode
                    ? 'bg-[#141416] hover:bg-[#1C1C1F] text-[#EDEDED] border-[#EDEDED]/10'
                    : 'bg-[#F2F1EC] hover:bg-[#E8E6DF] text-[#1A1A1A] border-[#1A1A1A]/10'
                }`}
              >
                <Dna className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>BIO 301: Cellular Respiration</span>
              </button>

              <button
                type="button"
                onClick={() => onLoadSampleNotes('cs')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] border text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  isNightMode
                    ? 'bg-[#141416] hover:bg-[#1C1C1F] text-[#EDEDED] border-[#EDEDED]/10'
                    : 'bg-[#F2F1EC] hover:bg-[#E8E6DF] text-[#1A1A1A] border-[#1A1A1A]/10'
                }`}
              >
                <Terminal className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>CS 201: Data Structures & Algorithms</span>
              </button>

              <button
                type="button"
                onClick={() => onLoadSampleNotes('pak')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] border text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  isNightMode
                    ? 'bg-[#141416] hover:bg-[#1C1C1F] text-[#EDEDED] border-[#EDEDED]/10'
                    : 'bg-[#F2F1EC] hover:bg-[#E8E6DF] text-[#1A1A1A] border-[#1A1A1A]/10'
                }`}
              >
                <Scale className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>PAK 101: Pakistan Constitutional History</span>
              </button>
            </div>
          </div>
        )}

        {/* Selectable Study Options (hidden while generating) */}
        {(step === 1 || step === 2 || step === 3) && !isGenerating && (
          <div className="w-full pt-2">
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
              isNightMode={isNightMode}
            />
          </div>
        )}

        {/* Loading / Thinking indicator — always last element in the chat thread */}
        {showThinking && (
          <Bubble sender="assistant" isNightMode={isNightMode}>
            <div className="flex items-center gap-3">
              <ThinkingDots />
              <span
                className={`text-[13px] font-medium ${
                  isNightMode ? 'text-[#EDEDED]' : 'text-[#1A1A1A]'
                }`}
              >
                Generating study materials…
              </span>
            </div>
          </Bubble>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </main>
  );
};
