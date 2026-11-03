import React, { useState } from 'react';
import {
  FileText,
  FileCode,
  FileType,
  Share2,
  Download,
} from 'lucide-react';
import { StudyPackData } from '../types/studyPack';
import { exportToPDF } from '../utils/pdfExporter';
import { exportToDOCX } from '../utils/docxExporter';

interface DownloadBarProps {
  studyPack: StudyPackData | null;
  selectedFeatures: string[];
  examDate?: string;
  language: 'English' | 'Roman Urdu';
}

export const DownloadBar: React.FC<DownloadBarProps> = ({
  studyPack,
  selectedFeatures,
  examDate,
  language,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!studyPack) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  /**
   * Helper to format content as Markdown
   */
  const generateMarkdownText = () => {
    let out = `# Notes2Quiz — University Study Pack\n\n`;
    out += `> **Language**: ${language} | **Target Exam**: ${examDate || 'General Study'} | *Created by Farhan Ali*\n\n---\n\n`;

    const isFull = selectedFeatures.includes('full_package');

    if (isFull || selectedFeatures.includes('simplified_notes')) {
      out += `## 1. Simplified Notes\n\n### ${studyPack.simplifiedNotes.title}\n\n`;
      studyPack.simplifiedNotes.sections.forEach((sec) => {
        out += `#### ${sec.heading}\n\n${sec.content}\n\n`;
      });
    }

    if (isFull || selectedFeatures.includes('key_points')) {
      out += `## 2. Key High-Yield Points\n\n*${studyPack.keyPoints.summary}*\n\n`;
      studyPack.keyPoints.points.forEach((pt) => {
        out += `- ${pt}\n`;
      });
      out += `\n`;
    }

    if (isFull || selectedFeatures.includes('mcqs')) {
      out += `## 3. Practice MCQs\n\n`;
      studyPack.mcqs.forEach((m, idx) => {
        out += `**Q${idx + 1}: ${m.question}**\n\n`;
        m.options.forEach((opt, oIdx) => {
          out += `- [${oIdx === m.correctIndex ? 'x' : ' '}] **${String.fromCharCode(65 + oIdx)}**. ${opt}\n`;
        });
        out += `\n*Explanation*: ${m.explanation}\n\n`;
      });
    }

    if (isFull || selectedFeatures.includes('flashcards')) {
      out += `## 4. Flashcards\n\n`;
      studyPack.flashcards.forEach((f, idx) => {
        out += `### Card ${idx + 1}: ${f.keyTerm || 'Term'}\n\n`;
        out += `**Question**: ${f.front}\n\n`;
        out += `**Answer**: ${f.back}\n\n`;
      });
    }

    if (isFull || selectedFeatures.includes('exam_notes')) {
      out += `## 5. Exam Notes (★ Best for Exams)\n\n### Short Questions\n\n`;
      studyPack.examNotes.shortQuestions.forEach((sq) => {
        out += `**${sq.question}** [${sq.marks} Marks]\n\n*Answer*: ${sq.answer}\n\n`;
      });
      out += `### Long Questions\n\n`;
      studyPack.examNotes.longQuestions.forEach((lq) => {
        out += `**${lq.question}** [${lq.marks} Marks]\n\nOutline:\n`;
        lq.outline.forEach((o) => {
          out += `- ${o}\n`;
        });
        out += `\n`;
      });
    }

    if (isFull || selectedFeatures.includes('revision_plan')) {
      out += `## 6. Personal Revision Timeline\n\n`;
      studyPack.revisionPlan.days.forEach((d) => {
        out += `### ${d.dateStr}: ${d.topic} (${d.duration})\n\n`;
        d.tasks.forEach((t) => {
          out += `- [ ] ${t}\n`;
        });
        out += `\n`;
      });
    }

    if (isFull || selectedFeatures.includes('active_recall')) {
      out += `## 7. Active Recall Mode\n\n`;
      studyPack.activeRecall.forEach((ar, idx) => {
        out += `**Q${idx + 1} (${ar.concept}): ${ar.question}**\n\n`;
        out += `*Hint*: ${ar.hint}\n\n`;
        out += `<details><summary>Click to reveal answer</summary>\n\n${ar.answer}\n\n</details>\n\n`;
      });
    }

    return out;
  };

  /**
   * Helper to format content as plain text
   */
  const generatePlainText = () => {
    let out = `========================================\n`;
    out += `NOTES2QUIZ STUDY PACK\n`;
    out += `Language: ${language}\n`;
    if (examDate) out += `Target Exam: ${examDate}\n`;
    out += `Created with Notes2Quiz (by Farhan Ali)\n`;
    out += `========================================\n\n`;

    const isFull = selectedFeatures.includes('full_package');

    if (isFull || selectedFeatures.includes('simplified_notes')) {
      out += `--- SIMPLIFIED NOTES ---\n`;
      out += `${studyPack.simplifiedNotes.title}\n\n`;
      studyPack.simplifiedNotes.sections.forEach((sec) => {
        out += `${sec.heading}\n${sec.content.replace(/\*\*/g, '')}\n\n`;
      });
    }

    if (isFull || selectedFeatures.includes('key_points')) {
      out += `--- KEY HIGH-YIELD POINTS ---\n`;
      out += `${studyPack.keyPoints.summary}\n`;
      studyPack.keyPoints.points.forEach((pt) => {
        out += `• ${pt.replace(/\*\*/g, '')}\n`;
      });
      out += `\n`;
    }

    if (isFull || selectedFeatures.includes('mcqs')) {
      out += `--- MULTIPLE CHOICE QUESTIONS ---\n`;
      studyPack.mcqs.forEach((m, idx) => {
        out += `Q${idx + 1}: ${m.question}\n`;
        m.options.forEach((opt, oIdx) => {
          out += `  ${String.fromCharCode(65 + oIdx)}. ${opt}\n`;
        });
        out += `  Correct: Option ${String.fromCharCode(65 + m.correctIndex)} (${m.options[m.correctIndex]})\n`;
        out += `  Explanation: ${m.explanation}\n\n`;
      });
    }

    if (isFull || selectedFeatures.includes('flashcards')) {
      out += `--- FLASHCARDS ---\n`;
      studyPack.flashcards.forEach((f, idx) => {
        out += `[Card ${idx + 1} - ${f.keyTerm || 'Term'}]\n`;
        out += `Q: ${f.front}\n`;
        out += `A: ${f.back}\n\n`;
      });
    }

    if (isFull || selectedFeatures.includes('exam_notes')) {
      out += `--- EXAM NOTES (SHORT + LONG QUESTIONS) ---\n`;
      out += `SHORT QUESTIONS:\n`;
      studyPack.examNotes.shortQuestions.forEach((sq) => {
        out += `${sq.question} [${sq.marks} Marks]\nAnswer: ${sq.answer}\n\n`;
      });
      out += `LONG QUESTIONS:\n`;
      studyPack.examNotes.longQuestions.forEach((lq) => {
        out += `${lq.question} [${lq.marks} Marks]\nOutline:\n`;
        lq.outline.forEach((o) => {
          out += ` - ${o}\n`;
        });
        out += `\n`;
      });
    }

    if (isFull || selectedFeatures.includes('revision_plan')) {
      out += `--- PERSONAL REVISION TIMELINE ---\n`;
      studyPack.revisionPlan.days.forEach((d) => {
        out += `${d.dateStr}: ${d.topic} (${d.duration})\n`;
        d.tasks.forEach((t) => {
          out += `  [ ] ${t}\n`;
        });
        out += `\n`;
      });
    }

    if (isFull || selectedFeatures.includes('active_recall')) {
      out += `--- ACTIVE RECALL MODE ---\n`;
      studyPack.activeRecall.forEach((ar, idx) => {
        out += `Q${idx + 1} (${ar.concept}): ${ar.question}\n`;
        out += `Hint: ${ar.hint}\n`;
        out += `Answer: ${ar.answer}\n\n`;
      });
    }

    return out;
  };

  /**
   * PDF Download using jsPDF
   */
  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      await exportToPDF({
        studyPack,
        selectedFeatures,
        examDate,
        language,
      });
      showToast('PDF downloaded successfully');
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * DOCX Download using docx library
   */
  const handleDownloadDOCX = async () => {
    try {
      setIsExporting(true);
      await exportToDOCX({
        studyPack,
        selectedFeatures,
        examDate,
        language,
      });
      showToast('Word (.docx) downloaded successfully');
    } catch (err) {
      console.error('DOCX export failed:', err);
      showToast('Failed to export DOCX');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * TXT Download using Blob
   */
  const handleDownloadTXT = () => {
    try {
      const text = generatePlainText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'notes2quiz-pack.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('TXT file downloaded');
    } catch (err) {
      console.error('TXT export failed:', err);
      showToast('Failed to export TXT');
    }
  };

  /**
   * Markdown Download using Blob
   */
  const handleDownloadMD = () => {
    try {
      const md = generateMarkdownText();
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'notes2quiz-pack.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Markdown (.md) downloaded');
    } catch (err) {
      console.error('Markdown export failed:', err);
      showToast('Failed to export Markdown');
    }
  };

  /**
   * Share Link
   */
  const handleShare = async () => {
    const shareUrl = 'https://notes2quiz.pages.dev/s/demo123';
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Share link copied (coming soon)');
    } catch {
      showToast('Share link copied (coming soon)');
    }
  };

  return (
    <div className="w-full bg-[#141414] border-t border-[#1F1F1F] py-2 px-3 sm:px-4 shrink-0 relative">
      {/* Toast notification */}
      {toastMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-[#1F1F1F] text-[#14AC8C] border border-[#14AC8C]/40 text-[12px] font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      <div className="max-w-[720px] mx-auto flex items-center justify-between gap-1 sm:gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A1] hidden md:inline shrink-0">
          Export Pack:
        </span>

        <div className="flex items-center justify-around sm:justify-start gap-1 sm:gap-2 flex-1">
          {/* PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            aria-label="Export as PDF"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[8px] bg-[#1F1F1F] text-[#FCFCFC] hover:bg-[#282828] hover:text-[#14AC8C] active:scale-95 transition-all text-[11px] font-medium border border-transparent hover:border-[#14AC8C]/30 cursor-pointer min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5 text-[#14AC8C]" />
            <span>PDF</span>
          </button>

          {/* DOCX Button */}
          <button
            type="button"
            onClick={handleDownloadDOCX}
            disabled={isExporting}
            aria-label="Export as DOCX"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[8px] bg-[#1F1F1F] text-[#FCFCFC] hover:bg-[#282828] hover:text-[#14AC8C] active:scale-95 transition-all text-[11px] font-medium border border-transparent hover:border-[#14AC8C]/30 cursor-pointer min-h-[38px]"
          >
            <FileType className="w-3.5 h-3.5 text-[#344CE4]" />
            <span>DOCX</span>
          </button>

          {/* TXT Button */}
          <button
            type="button"
            onClick={handleDownloadTXT}
            disabled={isExporting}
            aria-label="Export as TXT"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[8px] bg-[#1F1F1F] text-[#FCFCFC] hover:bg-[#282828] hover:text-[#14AC8C] active:scale-95 transition-all text-[11px] font-medium border border-transparent hover:border-[#14AC8C]/30 cursor-pointer min-h-[38px]"
          >
            <FileText className="w-3.5 h-3.5 text-[#A1A1A1]" />
            <span>TXT</span>
          </button>

          {/* Markdown Button */}
          <button
            type="button"
            onClick={handleDownloadMD}
            disabled={isExporting}
            aria-label="Export as Markdown"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[8px] bg-[#1F1F1F] text-[#FCFCFC] hover:bg-[#282828] hover:text-[#14AC8C] active:scale-95 transition-all text-[11px] font-medium border border-transparent hover:border-[#14AC8C]/30 cursor-pointer min-h-[38px]"
          >
            <FileCode className="w-3.5 h-3.5 text-[#FFD166]" />
            <span>Markdown</span>
          </button>

          {/* Share Link Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share study link"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[8px] bg-[#1F1F1F] text-[#FCFCFC] hover:bg-[#282828] hover:text-[#14AC8C] active:scale-95 transition-all text-[11px] font-medium border border-transparent hover:border-[#14AC8C]/30 cursor-pointer min-h-[38px] ml-auto"
          >
            <Share2 className="w-3.5 h-3.5 text-[#14AC8C]" />
            <span>Share link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
