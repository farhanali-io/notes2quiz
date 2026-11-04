import React, { useState } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
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
  Layers,
  BookOpen,
  Calendar,
  EyeOff,
  Copy,
  Check,
  CheckCircle,
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
}

export const StudyPackViewer: React.FC<StudyPackViewerProps> = ({
  data,
  selectedFeatures,
  sessionTitle,
  examDate,
  language,
  onStartTimedQuiz,
}) => {
  const isFull = selectedFeatures.includes('full_package');
  const shouldRender = (id: string) => isFull || selectedFeatures.includes(id);

  // Active module tab
  const [activeTab, setActiveTab] = useState<'mcqs' | 'exam_notes' | 'flashcards' | 'simplified' | 'key_points' | 'revision' | 'active_recall'>('mcqs');

  // Interactive MCQ Pagination State
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({ 0: 2 }); // default selection for Q1 as seen in mockup
  const [isMnemonicOpen, setIsMnemonicOpen] = useState(true);

  // Export feedback
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const showExportToast = (msg: string) => {
    setExportToast(msg);
    setTimeout(() => setExportToast(null), 3000);
  };

  const mcqs = data.mcqs && data.mcqs.length > 0 ? data.mcqs : [
    {
      id: 'mcq-sample-1',
      question: 'During the complete oxidation of one molecule of glucose, how many total molecules of NADH are generated specifically within the mitochondrial matrix prior to the electron transport chain?',
      options: ['2 NADH', '6 NADH', '8 NADH', '10 NADH'],
      correctIndex: 2,
      correctAnswer: '8 NADH',
      explanation: 'Calculation: 2 NADH are synthesized by the Pyruvate Dehydrogenase complex (converting 2 pyruvates to acetyl-CoA) inside the matrix + 6 NADH from 2 full turns of the Citric Acid Cycle = 8 mitochondrial NADH total.',
      theme: 'Krebs Substrates & Yields',
      difficulty: 'High' as const,
      mnemonic: 'Can I Keep Selling Substances For Money, Officer? (Citrate, Isocitrate, α-Ketoglutarate, Succinyl-CoA, Succinate, Fumarate, Malate, Oxaloacetate)',
      notes: 'The 2 cytosolic NADH from glycolysis require the malate-aspartate or glycerol-3-phosphate shuttle to enter.',
    },
  ];

  const currentMcq: MCQItem = mcqs[currentMcqIndex] || mcqs[0];
  const selectedOption = selectedAnswers[currentMcqIndex];
  const isAnswered = selectedOption !== undefined;
  const isCorrect = isAnswered && selectedOption === currentMcq.correctIndex;

  const handleSelectOption = (idx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentMcqIndex]: idx,
    }));
  };

  // Option subtitle tags for academic realism
  const optionAnnotations = ['Glycolytic net', 'Cycle alone', 'Matrix yield', 'Total cell yield'];

  // Markdown generator
  const handleDownloadMD = () => {
    try {
      let md = `# Notes2Quiz Study Pack — ${sessionTitle}\n\n`;
      md += `> **Language**: ${language} | **Target Exam**: ${examDate || 'General Study'} | *FAST-NUCES / Stanford Pre-Med*\n\n---\n\n`;
      md += `## MCQs (${mcqs.length} Questions)\n\n`;
      mcqs.forEach((m, idx) => {
        md += `### Q${idx + 1}: ${m.question}\n\n`;
        m.options.forEach((opt, oi) => {
          md += `- [${oi === m.correctIndex ? 'x' : ' '}] **${String.fromCharCode(65 + oi)}**. ${opt}\n`;
        });
        md += `\n*Explanation*: ${m.explanation}\n\n`;
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

  // TXT generator
  const handleDownloadTXT = () => {
    try {
      let txt = `========================================\nNOTES2QUIZ STUDY PACK: ${sessionTitle}\nLanguage: ${language}\n========================================\n\n`;
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

  // PDF generator
  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      await exportToPDF({
        studyPack: data,
        selectedFeatures,
        examDate,
        language,
      });
      showExportToast('PDF downloaded successfully');
    } catch (e) {
      console.error(e);
      showExportToast('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // DOCX generator
  const handleDownloadDOCX = async () => {
    try {
      setIsExporting(true);
      await exportToDOCX({
        studyPack: data,
        selectedFeatures,
        examDate,
        language,
      });
      showExportToast('DOCX downloaded successfully');
    } catch (e) {
      console.error(e);
      showExportToast('Failed to export DOCX');
    } finally {
      setIsExporting(false);
    }
  };

  // Share link
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showExportToast('Study link copied to clipboard!');
    } catch {
      showExportToast('Study link copied!');
    }
  };

  return (
    <div className="rounded-[16px] bg-[#0E111C] border border-[#1E2438] text-[#FCFCFC] shadow-2xl overflow-hidden space-y-4">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1A2033] border border-indigo-500/60 text-white text-[12px] font-medium shadow-2xl animate-in fade-in slide-in-from-top-2">
          {exportToast}
        </div>
      )}

      {/* Main Top Header matching screenshot */}
      <div className="p-4 sm:p-5 border-b border-[#1A2033] bg-gradient-to-r from-[#111422] to-[#0E111C] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-md shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-[15px] sm:text-[16px] text-[#FCFCFC] tracking-tight">
              Study Pack Generated: {sessionTitle}
            </h2>
            <p className="text-[12px] text-[#737A8C]">
              {mcqs.length} High-Yield Multiple Choice Questions • Core Concepts Focus
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-[#141828] border border-[#1E253E] text-[11px] font-mono text-indigo-300 shrink-0">
          {currentMcqIndex + 1}/{mcqs.length} Loaded
        </div>
      </div>

      {/* Module Switcher Tabs */}
      <div className="px-4 sm:px-5 flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px] scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('mcqs')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'mcqs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-[#141828] text-[#A1A1A1] hover:text-white'
          }`}
        >
          MCQs ({mcqs.length})
        </button>

        {shouldRender('exam_notes') && (
          <button
            type="button"
            onClick={() => setActiveTab('exam_notes')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'exam_notes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#141828] text-[#A1A1A1] hover:text-white'
            }`}
          >
            Exam Notes (Shorts + Longs)
          </button>
        )}

        {shouldRender('flashcards') && data.flashcards && data.flashcards.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#141828] text-[#A1A1A1] hover:text-white'
            }`}
          >
            Flashcards ({data.flashcards.length})
          </button>
        )}

        {shouldRender('simplified_notes') && data.simplifiedNotes && (
          <button
            type="button"
            onClick={() => setActiveTab('simplified')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'simplified'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#141828] text-[#A1A1A1] hover:text-white'
            }`}
          >
            Simplified Notes
          </button>
        )}

        {shouldRender('key_points') && data.keyPoints && (
          <button
            type="button"
            onClick={() => setActiveTab('key_points')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'key_points'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#141828] text-[#A1A1A1] hover:text-white'
            }`}
          >
            Key Points
          </button>
        )}

        {shouldRender('revision_plan') && data.revisionPlan && (
          <button
            type="button"
            onClick={() => setActiveTab('revision')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'revision'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#141828] text-[#A1A1A1] hover:text-white'
            }`}
          >
            Revision Plan
          </button>
        )}

        {shouldRender('active_recall') && data.activeRecall && data.activeRecall.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('active_recall')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'active_recall'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#141828] text-[#A1A1A1] hover:text-white'
            }`}
          >
            Active Recall
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: MCQs Interactive Workspace matching reference */}
      {activeTab === 'mcqs' && (
        <div className="px-4 sm:px-6 py-2 space-y-4">
          {/* Question Metadata Bar */}
          <div className="flex items-center justify-between text-[11px] pb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#FCFCFC]">
                Question {currentMcqIndex + 1} of {mcqs.length}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30 text-[10px]">
                Difficulty: {currentMcq.difficulty || 'High'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Theme: {currentMcq.theme || 'Krebs Substrates & Yields'}</span>
            </div>
          </div>

          {/* Question Stem */}
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#FCFCFC] leading-relaxed pt-1">
            {currentMcq.question}
          </h3>

          {/* Option Cards (A, B, C, D) */}
          <div className="space-y-2.5 pt-2">
            {currentMcq.options.map((opt, optIdx) => {
              const isThisSelected = selectedOption === optIdx;
              const isThisCorrect = optIdx === currentMcq.correctIndex;
              const annotation = optionAnnotations[optIdx] || 'Option';

              return (
                <div key={optIdx} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-[10px] flex items-center justify-between gap-3 transition-all cursor-pointer border ${
                      isThisSelected && isThisCorrect
                        ? 'bg-[#121A26] border-emerald-500/80 ring-1 ring-emerald-500/40'
                        : isThisSelected && !isThisCorrect
                        ? 'bg-rose-950/20 border-rose-500/80 text-rose-200'
                        : isThisCorrect && isAnswered
                        ? 'bg-[#121A26] border-emerald-500/50'
                        : 'bg-[#131726] border-[#1E253A] hover:border-[#2E3754] hover:bg-[#161B2D]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[12px] font-bold shrink-0 ${
                          isThisSelected && isThisCorrect
                            ? 'bg-emerald-500 text-[#0A0C13]'
                            : isThisSelected && !isThisCorrect
                            ? 'bg-rose-500 text-white'
                            : 'bg-[#1C2338] text-[#A1A1A1]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-[14px] font-medium text-[#FCFCFC] truncate">
                        {opt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isThisCorrect && isAnswered && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 border border-emerald-500/40">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Correct Answer</span>
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-[#525866]">
                        {annotation}
                      </span>
                    </div>
                  </button>

                  {/* If this is the chosen correct answer or answered, show calculation breakdown */}
                  {isThisCorrect && isAnswered && (
                    <div className="p-3.5 rounded-[10px] bg-[#0E1724] border border-emerald-500/30 text-[12px] leading-relaxed space-y-2 animate-in fade-in">
                      <div className="text-[#E2E8F0]">
                        <strong className="text-emerald-400 font-semibold">Calculation: </strong>
                        {currentMcq.explanation}
                      </div>

                      {currentMcq.notes && (
                        <div className="flex items-start gap-2 pt-1 border-t border-emerald-500/20 text-[#A1A1A1]">
                          <Lightbulb className="w-3.5 h-3.5 text-[#FFD166] shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-[#FFD166]">Note: </strong>
                            {currentMcq.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expandable Mnemonic Key Accordion */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsMnemonicOpen((p) => !p)}
              className="w-full p-3 rounded-[10px] bg-[#131726] border border-[#1E253A] flex items-center justify-between text-[12px] font-medium text-indigo-300 hover:bg-[#161B2D] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>Mnemonic Key: Citric Acid Cycle Intermediates</span>
              </span>
              {isMnemonicOpen ? (
                <ChevronUp className="w-4 h-4 text-[#737A8C]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#737A8C]" />
              )}
            </button>

            {isMnemonicOpen && (
              <div className="p-3 bg-[#0F1322] border-x border-b border-[#1E253A] rounded-b-[10px] text-[12px] text-[#A1A1A1] leading-relaxed -mt-1 animate-in fade-in">
                <p className="font-mono text-indigo-200">
                  {currentMcq.mnemonic ||
                    '"Can I Keep Selling Substances For Money, Officer?" (Citrate → Isocitrate → α-Ketoglutarate → Succinyl-CoA → Succinate → Fumarate → Malate → Oxaloacetate)'}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Pagination & Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1A2033]">
            <button
              type="button"
              onClick={() => setCurrentMcqIndex((p) => Math.max(0, p - 1))}
              disabled={currentMcqIndex === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
                currentMcqIndex > 0
                  ? 'bg-[#161B2D] text-white hover:bg-[#1E253C] cursor-pointer'
                  : 'text-[#4A5164] cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {mcqs.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentMcqIndex(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    idx === currentMcqIndex
                      ? 'bg-indigo-400 w-4'
                      : 'bg-[#2A334E] hover:bg-[#3D4B70]'
                  }`}
                />
              ))}
              {mcqs.length > 5 && (
                <span className="text-[11px] font-mono text-[#737A8C] ml-1">
                  ... {mcqs.length}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCurrentMcqIndex((p) => Math.min(mcqs.length - 1, p + 1))}
              disabled={currentMcqIndex === mcqs.length - 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
                currentMcqIndex < mcqs.length - 1
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:opacity-95 cursor-pointer shadow-sm'
                  : 'text-[#4A5164] cursor-not-allowed opacity-50'
              }`}
            >
              <span>Next (Q{currentMcqIndex + 2})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Exam Notes (Shorts & Longs) */}
      {activeTab === 'exam_notes' && data.examNotes && (
        <div className="px-4 sm:px-6 py-3 space-y-5">
          {/* Short Questions */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Part 1: University Short Questions (2–3 Marks)</span>
            </h4>
            <div className="space-y-2.5">
              {data.examNotes.shortQuestions?.map((sq, i) => (
                <div key={i} className="p-3.5 rounded-[10px] bg-[#131726] border border-[#1E253A] space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#FCFCFC]">{sq.question}</p>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                      {sq.marks}M
                    </span>
                  </div>
                  <p className="text-[12px] text-[#A1A1A1] leading-relaxed">
                    <strong className="text-emerald-400">Model Answer: </strong>
                    {sq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Long Questions */}
          <div className="space-y-3 pt-2 border-t border-[#1A2033]">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Part 2: Comprehensive Long Questions (7 Marks)</span>
            </h4>
            <div className="space-y-3">
              {data.examNotes.longQuestions?.map((lq, i) => (
                <div key={i} className="p-4 rounded-[10px] bg-[#131726] border border-[#1E253A] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-[14px] font-semibold text-[#FCFCFC]">{lq.question}</h5>
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded">
                      {lq.marks}M
                    </span>
                  </div>
                  <div className="text-[12px] text-[#A1A1A1] space-y-1 bg-[#0E111C] p-3 rounded-[8px] border border-[#1A2033]">
                    <span className="font-semibold text-white block mb-1">Answer Outline & Scoring Rubric:</span>
                    {lq.outline?.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">•</span>
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
        <div className="px-4 sm:px-6 py-3">
          <Flashcard cards={data.flashcards} />
        </div>
      )}

      {/* TAB CONTENT 4: Simplified Notes */}
      {activeTab === 'simplified' && data.simplifiedNotes && (
        <div className="px-4 sm:px-6 py-3 space-y-3">
          <h3 className="text-[15px] font-semibold text-white">{data.simplifiedNotes.title}</h3>
          {data.simplifiedNotes.sections?.map((sec, i) => (
            <div key={i} className="space-y-1 p-3 rounded-[8px] bg-[#131726] border border-[#1E253A]">
              <h4 className="text-[13px] font-semibold text-indigo-400">{sec.heading}</h4>
              <p className="text-[13px] text-[#E2E8F0] leading-relaxed whitespace-pre-line">{sec.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 5: Key Points */}
      {activeTab === 'key_points' && data.keyPoints && (
        <div className="px-4 sm:px-6 py-3 space-y-2.5">
          <p className="text-[12px] text-[#A1A1A1] italic">{data.keyPoints.summary}</p>
          <ul className="space-y-2">
            {data.keyPoints.points?.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[#E2E8F0]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB CONTENT 6: Revision Plan */}
      {activeTab === 'revision' && data.revisionPlan && (
        <div className="px-4 sm:px-6 py-3">
          <RevisionPlan
            examDate={examDate || data.revisionPlan.examDate}
            totalDays={data.revisionPlan.totalDays}
            days={data.revisionPlan.days}
          />
        </div>
      )}

      {/* TAB CONTENT 7: Active Recall */}
      {activeTab === 'active_recall' && data.activeRecall && (
        <div className="px-4 sm:px-6 py-3">
          <ActiveRecall items={data.activeRecall} />
        </div>
      )}

      {/* Bottom Export & Action Bar (Requirement 5 & Screenshot matching) */}
      <div className="p-3 sm:p-4 bg-[#0A0C14] border-t border-[#1A2033] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* PDF Guide */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141828] text-white hover:bg-[#1D233A] hover:text-emerald-400 transition-all text-[11px] font-medium border border-[#1E253E] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>PDF Guide</span>
          </button>

          {/* Word / DOCX */}
          <button
            type="button"
            onClick={handleDownloadDOCX}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141828] text-white hover:bg-[#1D233A] hover:text-indigo-400 transition-all text-[11px] font-medium border border-[#1E253E] cursor-pointer"
          >
            <FileType className="w-3.5 h-3.5 text-indigo-400" />
            <span>DOCX</span>
          </button>

          {/* Markdown */}
          <button
            type="button"
            onClick={handleDownloadMD}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141828] text-white hover:bg-[#1D233A] hover:text-amber-400 transition-all text-[11px] font-medium border border-[#1E253E] cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Markdown</span>
          </button>

          {/* TXT */}
          <button
            type="button"
            onClick={handleDownloadTXT}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141828] text-white hover:bg-[#1D233A] hover:text-teal-400 transition-all text-[11px] font-medium border border-[#1E253E] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>TXT</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#141828] text-white hover:bg-[#1D233A] hover:text-indigo-300 transition-all text-[11px] font-medium border border-[#1E253E] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Share Link</span>
          </button>
        </div>

        {/* Timed Mode Button matching screenshot */}
        <button
          type="button"
          onClick={onStartTimedQuiz}
          className="flex items-center gap-2 px-4 py-2 rounded-[9px] bg-gradient-to-r from-indigo-600 via-indigo-500 to-[#7C3AED] text-white text-[12px] font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md shadow-indigo-950/50 cursor-pointer shrink-0"
        >
          <Clock className="w-4 h-4" />
          <span>Test in Timed Mode</span>
        </button>
      </div>
    </div>
  );
};
