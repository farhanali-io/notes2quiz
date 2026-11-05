import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Share2,
  FileText,
  FileType,
  FileCode,
  GraduationCap,
  BookOpen,
  Check,
} from 'lucide-react';
import { StudyPackData, MCQItem } from '../types/studyPack';
import { Flashcard } from './Flashcard';
import { RevisionPlan } from './RevisionPlan';
import { ActiveRecall } from './ActiveRecall';
import { exportToPDF } from '../utils/pdfExporter';
import { exportToDOCX } from '../utils/docxExporter';

interface StudyPackViewerProps {
  data: StudyPackData;
  selectedFeatures: string[];
  sessionTitle: string;
  examDate?: string;
  language: 'English' | 'Roman Urdu';
  onStartTimedQuiz: () => void;
  isNightMode?: boolean;
}

export const StudyPackViewer: React.FC<StudyPackViewerProps> = ({
  data,
  selectedFeatures,
  sessionTitle,
  examDate,
  language,
  onStartTimedQuiz,
  isNightMode = true,
}) => {
  const isFull = selectedFeatures.includes('full_package');
  const shouldRender = (id: string) => isFull || selectedFeatures.includes(id);

  const [activeTab, setActiveTab] = useState<
    'mcqs' | 'exam_notes' | 'flashcards' | 'simplified' | 'key_points' | 'revision' | 'active_recall'
  >('mcqs');

  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isMnemonicOpen, setIsMnemonicOpen] = useState(true);

  const [exportToast, setExportToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const showExportToast = (msg: string) => {
    setExportToast(msg);
    setTimeout(() => setExportToast(null), 3000);
  };

  const mcqs: MCQItem[] = Array.isArray(data.mcqs) ? data.mcqs : [];

  const currentMcq: MCQItem = mcqs[currentMcqIndex] || mcqs[0];
  const selectedOption = selectedAnswers[currentMcqIndex];
  const isAnswered = selectedOption !== undefined;

  const handleSelectOption = (idx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentMcqIndex]: idx,
    }));
  };

  const handleDownloadMD = () => {
    try {
      let md = `# Notes2Quiz Study Pack: ${sessionTitle}\n\n`;
      md += `> Language: ${language} | Target Exam: ${examDate || 'General Study'}\n\n---\n\n`;
      md += `## MCQs (${mcqs.length} Questions)\n\n`;
      mcqs.forEach((m, idx) => {
        md += `### Q${idx + 1}: ${m.question}\n\n`;
        m.options.forEach((opt, oi) => {
          md += `- [${oi === m.correctIndex ? 'x' : ' '}] ${String.fromCharCode(65 + oi)}. ${opt}\n`;
        });
        md += `\nExplanation: ${m.explanation}\n\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sessionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-pack.md`;
      a.click();
      URL.revokeObjectURL(a.href);
      showExportToast('Markdown downloaded');
    } catch {
      showExportToast('Failed to export Markdown');
    }
  };

  const handleDownloadTXT = () => {
    try {
      let txt = `NOTES2QUIZ STUDY PACK: ${sessionTitle}\nLanguage: ${language}\n\n`;
      mcqs.forEach((m, idx) => {
        txt += `Q${idx + 1}: ${m.question}\n`;
        m.options.forEach((opt, oi) => {
          txt += `  ${String.fromCharCode(65 + oi)}. ${opt}\n`;
        });
        txt += `  Correct Answer: Option ${String.fromCharCode(65 + m.correctIndex)} (${m.options[m.correctIndex]})\n`;
        txt += `  Explanation: ${m.explanation}\n\n`;
      });
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sessionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-pack.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      showExportToast('TXT file downloaded');
    } catch {
      showExportToast('Failed to export TXT');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      await exportToPDF({
        studyPack: data,
        selectedFeatures,
        examDate,
        language,
      });
      showExportToast('PDF downloaded');
    } catch (e) {
      console.error(e);
      showExportToast('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadDOCX = async () => {
    try {
      setIsExporting(true);
      await exportToDOCX({
        studyPack: data,
        selectedFeatures,
        examDate,
        language,
      });
      showExportToast('DOCX downloaded');
    } catch (e) {
      console.error(e);
      showExportToast('Failed to export DOCX');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showExportToast('Study link copied');
    } catch {
      showExportToast('Study link copied');
    }
  };

  return (
    <div
      className={`w-full rounded-none overflow-hidden space-y-5 transition-colors duration-150 ${
        isNightMode
          ? 'bg-[#141416] text-[#EDEDED]'
          : 'bg-[#F2F1EC] text-[#1A1A1A]'
      }`}
    >
      {/* Toast Notification */}
      {exportToast && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-[6px] border text-[13px] font-medium shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
            isNightMode
              ? 'bg-[#1C1C1F] border-[#EDEDED]/15 text-[#EDEDED]'
              : 'bg-[#FAFAF7] border-[#1A1A1A]/15 text-[#1A1A1A]'
          }`}
        >
          {exportToast}
        </div>
      )}

      {/* Top Header */}
      <div
        className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
          isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <GraduationCap className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          <div className="min-w-0">
            <h2 className="font-medium text-[15px] sm:text-[16px] tracking-[-0.01em] break-words">
              {sessionTitle}
            </h2>
            <p
              className={`text-[13px] ${
                isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
              }`}
            >
              {mcqs.length} multiple choice questions · {language}
            </p>
          </div>
        </div>

        <span
          className={`text-[13px] shrink-0 ${
            isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
          }`}
        >
          {currentMcqIndex + 1} / {mcqs.length}
        </span>
      </div>

      {/* Module Switcher Tabs */}
      <div className="px-4 sm:px-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap hide-scrollbar pb-1 text-[13px]">
        <button
          type="button"
          onClick={() => setActiveTab('mcqs')}
          className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
            activeTab === 'mcqs'
              ? 'bg-[#2D4A3E] text-[#EDEDED]'
              : isNightMode
              ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
              : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
          }`}
        >
          MCQs ({mcqs.length})
        </button>

        {shouldRender('exam_notes') && (
          <button
            type="button"
            onClick={() => setActiveTab('exam_notes')}
            className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
              activeTab === 'exam_notes'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
            }`}
          >
            Exam notes
          </button>
        )}

        {shouldRender('flashcards') && data.flashcards && data.flashcards.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
            }`}
          >
            Flashcards ({data.flashcards.length})
          </button>
        )}

        {shouldRender('simplified_notes') && data.simplifiedNotes && (
          <button
            type="button"
            onClick={() => setActiveTab('simplified')}
            className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
              activeTab === 'simplified'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
            }`}
          >
            Simplified notes
          </button>
        )}

        {shouldRender('key_points') && data.keyPoints && (
          <button
            type="button"
            onClick={() => setActiveTab('key_points')}
            className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
              activeTab === 'key_points'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
            }`}
          >
            Key points
          </button>
        )}

        {shouldRender('revision_plan') && data.revisionPlan && (
          <button
            type="button"
            onClick={() => setActiveTab('revision')}
            className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
              activeTab === 'revision'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
            }`}
          >
            Revision plan
          </button>
        )}

        {shouldRender('active_recall') && data.activeRecall && data.activeRecall.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('active_recall')}
            className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
              activeTab === 'active_recall'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#1C1C1F]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E8E6DF]'
            }`}
          >
            Active recall
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: MCQs */}
      {activeTab === 'mcqs' && !currentMcq && (
        <div
          className={`px-4 sm:px-5 py-6 text-[14px] ${
            isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
          }`}
        >
          No multiple choice questions in this study pack. Select another tab above to view your generated materials.
        </div>
      )}

      {activeTab === 'mcqs' && currentMcq && (
        <div className="px-4 sm:px-5 py-2 space-y-4">
          {/* Question Metadata */}
          <div
            className={`flex flex-wrap items-center justify-between gap-1 text-[12px] ${
              isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
            }`}
          >
            <span>
              Question {currentMcqIndex + 1} of {mcqs.length} · Difficulty:{' '}
              {currentMcq.difficulty || 'High'}
            </span>
            <span>{currentMcq.theme || 'Core Concepts'}</span>
          </div>

          {/* Question Stem */}
          <h3 className="text-[15px] sm:text-[16px] font-medium leading-[1.6] break-words">
            {currentMcq.question}
          </h3>

          {/* Option Buttons */}
          <div className="flex flex-col space-y-2 pt-1">
            {currentMcq.options.map((opt, optIdx) => {
              const isThisSelected = selectedOption === optIdx;
              const isThisCorrect = optIdx === currentMcq.correctIndex;

              return (
                <div key={optIdx} className="space-y-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left py-3 px-3.5 rounded-[6px] flex items-center justify-between gap-3 transition-colors duration-150 cursor-pointer border ${
                      isThisSelected && isThisCorrect
                        ? 'bg-[#2D4A3E] border-[#2D4A3E] text-[#EDEDED]'
                        : isThisSelected && !isThisCorrect
                        ? isNightMode
                          ? 'bg-[#2A1717] border-[#7F2F2F] text-[#EDEDED]'
                          : 'bg-[#F5E6E6] border-[#B85C5C] text-[#1A1A1A]'
                        : isThisCorrect && isAnswered
                        ? isNightMode
                          ? 'bg-[#0B0B0C] border-[#2D4A3E] text-[#EDEDED]'
                          : 'bg-[#FAFAF7] border-[#2D4A3E] text-[#1A1A1A]'
                        : isNightMode
                        ? 'bg-[#0B0B0C] border-[#EDEDED]/10 hover:bg-[#1C1C1F] text-[#EDEDED]'
                        : 'bg-[#FAFAF7] border-[#1A1A1A]/10 hover:bg-[#E8E6DF] text-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-[4px] flex items-center justify-center text-[12px] font-medium shrink-0 mt-0.5 sm:mt-0 ${
                          isThisSelected && isThisCorrect
                            ? 'bg-[#0B0B0C]/30 text-[#EDEDED]'
                            : isThisSelected && !isThisCorrect
                            ? 'bg-[#7F2F2F] text-[#EDEDED]'
                            : isNightMode
                            ? 'bg-[#1C1C1F] text-[#8A8A8A]'
                            : 'bg-[#E8E6DF] text-[#6B6B6B]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-[14px] leading-[1.5] break-words text-left">
                        {opt}
                      </span>
                    </div>

                    {isThisCorrect && isAnswered && (
                      <span className="text-[12px] font-medium flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Correct</span>
                      </span>
                    )}
                  </button>

                  {isThisCorrect && isAnswered && (
                    <div
                      className={`p-3.5 rounded-none border-l-2 border-[#2D4A3E] text-[13px] leading-[1.6] space-y-2 ${
                        isNightMode
                          ? 'bg-[#0B0B0C] text-[#EDEDED]'
                          : 'bg-[#FAFAF7] text-[#1A1A1A]'
                      }`}
                    >
                      <div>
                        <span className="font-medium">Explanation: </span>
                        {currentMcq.explanation}
                      </div>

                      {currentMcq.notes && (
                        <div
                          className={`flex items-start gap-2 pt-2 border-t ${
                            isNightMode
                              ? 'border-[#EDEDED]/10 text-[#8A8A8A]'
                              : 'border-[#1A1A1A]/10 text-[#6B6B6B]'
                          }`}
                        >
                          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                          <span>{currentMcq.notes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expandable Mnemonic Key */}
          {currentMcq.mnemonic && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsMnemonicOpen((p) => !p)}
                className={`w-full p-3 rounded-[6px] border flex items-center justify-between text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  isNightMode
                    ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#EDEDED] hover:bg-[#1C1C1F]'
                    : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#E8E6DF]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4" strokeWidth={1.5} />
                  <span>Mnemonic key</span>
                </span>
                {isMnemonicOpen ? (
                  <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>

              {isMnemonicOpen && (
                <div
                  className={`p-3 border-x border-b text-[13px] leading-[1.6] ${
                    isNightMode
                      ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#8A8A8A]'
                      : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#6B6B6B]'
                  }`}
                >
                  {currentMcq.mnemonic}
                </div>
              )}
            </div>
          )}

          {/* Bottom Pagination */}
          <div
            className={`flex items-center justify-between pt-4 border-t ${
              isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
            }`}
          >
            <button
              type="button"
              onClick={() => setCurrentMcqIndex((p) => Math.max(0, p - 1))}
              disabled={currentMcqIndex === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 ${
                currentMcqIndex > 0
                  ? isNightMode
                    ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F] cursor-pointer'
                    : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF] cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1.5">
              {mcqs.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentMcqIndex(idx)}
                  className={`h-1.5 rounded-[2px] cursor-pointer transition-colors duration-150 ${
                    idx === currentMcqIndex
                      ? 'bg-[#2D4A3E] w-4'
                      : isNightMode
                      ? 'bg-[#EDEDED]/20 hover:bg-[#EDEDED]/40 w-1.5'
                      : 'bg-[#1A1A1A]/20 hover:bg-[#1A1A1A]/40 w-1.5'
                  }`}
                />
              ))}
              {mcqs.length > 5 && (
                <span
                  className={`text-[12px] ml-1 ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  · {mcqs.length}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCurrentMcqIndex((p) => Math.min(mcqs.length - 1, p + 1))}
              disabled={currentMcqIndex === mcqs.length - 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 ${
                currentMcqIndex < mcqs.length - 1
                  ? 'bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Exam Notes */}
      {activeTab === 'exam_notes' && data.examNotes && (
        <div className="px-4 sm:px-5 py-2 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[14px] font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span>Short questions</span>
            </h4>
            <div className="space-y-3">
              {data.examNotes.shortQuestions?.map((sq, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-none space-y-2 ${
                    isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] font-medium break-words">{sq.question}</p>
                    <span
                      className={`text-[12px] shrink-0 ${
                        isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      {sq.marks} marks
                    </span>
                  </div>
                  <p
                    className={`text-[13px] leading-[1.6] break-words ${
                      isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                    }`}
                  >
                    {sq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`space-y-3 pt-4 border-t ${
              isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
            }`}
          >
            <h4 className="text-[14px] font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" strokeWidth={1.5} />
              <span>Long questions</span>
            </h4>
            <div className="space-y-3">
              {data.examNotes.longQuestions?.map((lq, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-none space-y-2 ${
                    isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-[14px] font-medium break-words">{lq.question}</h5>
                    <span
                      className={`text-[12px] shrink-0 ${
                        isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      {lq.marks} marks
                    </span>
                  </div>
                  <div
                    className={`text-[13px] space-y-1.5 pt-1 break-words ${
                      isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                    }`}
                  >
                    {lq.outline?.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2">
                        <span>·</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Flashcards */}
      {activeTab === 'flashcards' && data.flashcards && (
        <div className="px-4 sm:px-5 py-2">
          <Flashcard cards={data.flashcards} isNightMode={isNightMode} />
        </div>
      )}

      {/* TAB CONTENT 4: Simplified Notes */}
      {activeTab === 'simplified' && data.simplifiedNotes && (
        <div className="px-4 sm:px-5 py-2 space-y-3">
          <h3 className="text-[15px] font-medium break-words">{data.simplifiedNotes.title}</h3>
          {data.simplifiedNotes.sections?.map((sec, i) => (
            <div
              key={i}
              className={`space-y-1.5 p-4 rounded-none ${
                isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
              }`}
            >
              <h4 className="text-[14px] font-medium break-words">{sec.heading}</h4>
              <p
                className={`text-[14px] leading-[1.6] whitespace-pre-line break-words ${
                  isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                }`}
              >
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 5: Key Points */}
      {activeTab === 'key_points' && data.keyPoints && (
        <div className="px-4 sm:px-5 py-2 space-y-3">
          <p
            className={`text-[13px] break-words ${
              isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
            }`}
          >
            {data.keyPoints.summary}
          </p>
          <ul className="space-y-2">
            {data.keyPoints.points?.map((pt, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6] break-words">
                <span className="text-[#2D4A3E] font-medium">·</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB CONTENT 6: Revision Plan */}
      {activeTab === 'revision' && data.revisionPlan && (
        <div className="px-4 sm:px-5 py-2">
          <RevisionPlan
            examDate={examDate || data.revisionPlan.examDate}
            totalDays={data.revisionPlan.totalDays}
            days={data.revisionPlan.days}
            isNightMode={isNightMode}
          />
        </div>
      )}

      {/* TAB CONTENT 7: Active Recall */}
      {activeTab === 'active_recall' && data.activeRecall && (
        <div className="px-4 sm:px-5 py-2">
          <ActiveRecall items={data.activeRecall} isNightMode={isNightMode} />
        </div>
      )}

      {/* Bottom Export & Action Bar */}
      <div
        className={`p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
        }`}
      >
        <div className="flex items-center overflow-x-auto whitespace-nowrap gap-2 hide-scrollbar w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] transition-colors duration-150 text-[12px] font-medium border shrink-0 cursor-pointer ${
              isNightMode
                ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F] border-[#EDEDED]/10'
                : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF] border-[#1A1A1A]/10'
            }`}
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDOCX}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] transition-colors duration-150 text-[12px] font-medium border shrink-0 cursor-pointer ${
              isNightMode
                ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F] border-[#EDEDED]/10'
                : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF] border-[#1A1A1A]/10'
            }`}
          >
            <FileType className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>DOCX</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMD}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] transition-colors duration-150 text-[12px] font-medium border shrink-0 cursor-pointer ${
              isNightMode
                ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F] border-[#EDEDED]/10'
                : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF] border-[#1A1A1A]/10'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Markdown</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTXT}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] transition-colors duration-150 text-[12px] font-medium border shrink-0 cursor-pointer ${
              isNightMode
                ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F] border-[#EDEDED]/10'
                : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF] border-[#1A1A1A]/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>TXT</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] transition-colors duration-150 text-[12px] font-medium border shrink-0 cursor-pointer ${
              isNightMode
                ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F] border-[#EDEDED]/10'
                : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF] border-[#1A1A1A]/10'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Share link</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onStartTimedQuiz}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-[6px] bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] text-[13px] font-medium transition-colors duration-150 cursor-pointer shrink-0"
        >
          <Clock className="w-4 h-4" strokeWidth={1.5} />
          <span>Timed mode</span>
        </button>
      </div>
    </div>
  );
};
