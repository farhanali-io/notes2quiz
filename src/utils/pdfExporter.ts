import { StudyPackData } from '../data/mockPacks';

interface PDFExportOptions {
  studyPack: StudyPackData;
  selectedFeatures: string[];
  examDate?: string;
  language: string;
}

/**
 * Generates and downloads a clean, multi-page PDF using jsPDF
 * File saved as: notes2quiz-pack.pdf
 */
export async function exportToPDF({
  studyPack,
  selectedFeatures,
  examDate,
  language,
}: PDFExportOptions): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
  };

  // Header Banner
  doc.setFillColor(20, 172, 140); // Teal brand color #14AC8C
  doc.rect(margin, cursorY, contentWidth, 36, 'F');

  doc.setTextColor(17, 17, 17);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Notes2Quiz — University Study Pack', margin + 12, cursorY + 23);

  cursorY += 50;

  // Metadata Subheader
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const metaText = `Language: ${language}   |   Exam Date: ${examDate || 'General Study'}   |   Generated: ${new Date().toLocaleDateString()}`;
  doc.text(metaText, margin, cursorY);
  cursorY += 20;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 20;

  const isFull = selectedFeatures.includes('full_package');

  // Helper to add a section header
  const addSectionHeader = (title: string, tag: string = '') => {
    checkPageBreak(35);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, cursorY, contentWidth, 24, 3, 3, 'F');

    doc.setTextColor(20, 172, 140);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 10, cursorY + 16);

    if (tag) {
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(tag, pageWidth - margin - 10, cursorY + 16, { align: 'right' });
    }

    cursorY += 34;
  };

  // Helper to add paragraphs
  const addParagraph = (text: string, fontSize = 10, isBold = false, indent = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(isBold ? 30 : 60, isBold ? 30 : 60, isBold ? 30 : 60);

    const clean = text.replace(/\*\*/g, '');
    const lines = doc.splitTextToSize(clean, contentWidth - indent);
    checkPageBreak(lines.length * (fontSize * 1.35) + 6);

    doc.text(lines, margin + indent, cursorY);
    cursorY += lines.length * (fontSize * 1.35) + 6;
  };

  // 1. Simplified Notes
  if (isFull || selectedFeatures.includes('simplified_notes')) {
    addSectionHeader('Simplified Notes', 'Easy-to-Read');
    addParagraph(studyPack.simplifiedNotes.title, 12, true);

    studyPack.simplifiedNotes.sections.forEach((sec) => {
      addParagraph(sec.heading, 11, true);
      addParagraph(sec.content, 10, false, 8);
      cursorY += 4;
    });
    cursorY += 10;
  }

  // 2. Key Points
  if (isFull || selectedFeatures.includes('key_points')) {
    addSectionHeader('Key High-Yield Points', 'Quick Review');
    addParagraph(studyPack.keyPoints.summary, 10, true);

    studyPack.keyPoints.points.forEach((pt) => {
      addParagraph(`• ${pt}`, 10, false, 8);
    });
    cursorY += 10;
  }

  // 3. MCQs
  if (isFull || selectedFeatures.includes('mcqs')) {
    addSectionHeader('Multiple Choice Practice Questions', 'Self-Testing');
    studyPack.mcqs.forEach((m, idx) => {
      addParagraph(`Q${idx + 1}: ${m.question}`, 10, true);
      m.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        const isCorrect = oIdx === m.correctIndex;
        addParagraph(`${letter}. ${opt} ${isCorrect ? '(Correct Answer)' : ''}`, 9, isCorrect, 12);
      });
      addParagraph(`Explanation: ${m.explanation}`, 9, false, 12);
      cursorY += 6;
    });
    cursorY += 10;
  }

  // 4. Flashcards
  if (isFull || selectedFeatures.includes('flashcards')) {
    addSectionHeader('Study Flashcards', 'Question / Answer Pairs');
    studyPack.flashcards.forEach((f, idx) => {
      addParagraph(`Card ${idx + 1}: ${f.keyTerm || 'Core Concept'}`, 10, true);
      addParagraph(`Q: ${f.front}`, 9, false, 8);
      addParagraph(`A: ${f.back}`, 9, false, 8);
      cursorY += 4;
    });
    cursorY += 10;
  }

  // 5. Exam Notes
  if (isFull || selectedFeatures.includes('exam_notes')) {
    addSectionHeader('Exam Notes (Short & Long Questions)', '★ Best for Exams');

    addParagraph('--- Part 1: Short Questions (2-3 Marks) ---', 10, true);
    studyPack.examNotes.shortQuestions.forEach((sq) => {
      addParagraph(`${sq.question} [${sq.marks} Marks]`, 10, true, 4);
      addParagraph(`Model Answer: ${sq.answer}`, 9, false, 8);
      cursorY += 4;
    });

    addParagraph('--- Part 2: Long Subjective Questions (7 Marks) ---', 10, true);
    studyPack.examNotes.longQuestions.forEach((lq) => {
      addParagraph(`${lq.question} [${lq.marks} Marks]`, 10, true, 4);
      addParagraph('Key Answer Points / Outline:', 9, true, 8);
      lq.outline.forEach((o) => {
        addParagraph(`• ${o}`, 9, false, 14);
      });
      cursorY += 4;
    });
    cursorY += 10;
  }

  // 6. Revision Plan
  if (isFull || selectedFeatures.includes('revision_plan')) {
    addSectionHeader('Personal Revision Timeline', `${studyPack.revisionPlan.totalDays} Days Roadmap`);
    studyPack.revisionPlan.days.forEach((day) => {
      addParagraph(`${day.dateStr}: ${day.topic} [${day.duration}]`, 10, true);
      day.tasks.forEach((task) => {
        addParagraph(`[ ] ${task}`, 9, false, 8);
      });
      cursorY += 4;
    });
    cursorY += 10;
  }

  // 7. Active Recall
  if (isFull || selectedFeatures.includes('active_recall')) {
    addSectionHeader('Active Recall Mode', 'Retention Drilling');
    studyPack.activeRecall.forEach((ar, idx) => {
      addParagraph(`Q${idx + 1} (${ar.concept}): ${ar.question}`, 10, true);
      addParagraph(`Hint: ${ar.hint}`, 9, false, 8);
      addParagraph(`Answer: ${ar.answer}`, 9, false, 8);
      cursorY += 4;
    });
  }

  // Save PDF
  doc.save('notes2quiz-pack.pdf');
}
