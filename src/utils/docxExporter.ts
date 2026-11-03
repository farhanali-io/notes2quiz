import { StudyPackData } from '../types/studyPack';

interface DOCXExportOptions {
  studyPack: StudyPackData;
  selectedFeatures: string[];
  examDate?: string;
  language: string;
}

/**
 * Generates and downloads a real Microsoft Word .docx document using the `docx` library.
 * File saved as: notes2quiz-pack.docx
 */
export async function exportToDOCX({
  studyPack,
  selectedFeatures,
  examDate,
  language,
}: DOCXExportOptions): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
  } = await import('docx');

  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Notes2Quiz — University Study Pack',
          bold: true,
          size: 32,
          color: '14AC8C',
        }),
      ],
      spacing: { after: 120 },
    })
  );

  // Subtitle / Metadata
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Language: ${language}  |  Target Exam: ${examDate || 'General Study'}  |  Created with Notes2Quiz (by Farhan Ali)`,
          italics: true,
          size: 20,
          color: '666666',
        }),
      ],
      spacing: { after: 360 },
    })
  );

  const isFull = selectedFeatures.includes('full_package');

  // Helper for Section Headings
  const addHeading = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 26,
            color: '14AC8C',
          }),
        ],
        spacing: { before: 300, after: 120 },
      })
    );
  };

  // Helper for normal text
  const addParagraph = (text: string, bold = false, indent = 0) => {
    const clean = text.replace(/\*\*/g, '');
    children.push(
      new Paragraph({
        indent: indent ? { left: indent * 360 } : undefined,
        children: [
          new TextRun({
            text: clean,
            bold,
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      })
    );
  };

  // 1. Simplified Notes
  if (isFull || selectedFeatures.includes('simplified_notes')) {
    addHeading('1. Simplified Notes');
    addParagraph(studyPack.simplifiedNotes.title, true);
    studyPack.simplifiedNotes.sections.forEach((sec) => {
      addParagraph(sec.heading, true);
      addParagraph(sec.content, false, 1);
    });
  }

  // 2. Key Points
  if (isFull || selectedFeatures.includes('key_points')) {
    addHeading('2. Key High-Yield Points');
    addParagraph(studyPack.keyPoints.summary, true);
    studyPack.keyPoints.points.forEach((pt) => {
      addParagraph(`• ${pt}`, false, 1);
    });
  }

  // 3. MCQs
  if (isFull || selectedFeatures.includes('mcqs')) {
    addHeading('3. Practice Multiple Choice Questions');
    studyPack.mcqs.forEach((m, idx) => {
      addParagraph(`Q${idx + 1}: ${m.question}`, true);
      m.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        const isCorrect = oIdx === m.correctIndex;
        addParagraph(`${letter}. ${opt} ${isCorrect ? '(Correct Answer)' : ''}`, isCorrect, 1);
      });
      addParagraph(`Explanation: ${m.explanation}`, false, 1);
    });
  }

  // 4. Flashcards
  if (isFull || selectedFeatures.includes('flashcards')) {
    addHeading('4. Flashcards');
    studyPack.flashcards.forEach((f, idx) => {
      addParagraph(`Card ${idx + 1}: ${f.keyTerm || 'Term'}`, true);
      addParagraph(`Question: ${f.front}`, false, 1);
      addParagraph(`Answer: ${f.back}`, false, 1);
    });
  }

  // 5. Exam Notes
  if (isFull || selectedFeatures.includes('exam_notes')) {
    addHeading('5. Exam Notes (Short & Long Questions)');
    addParagraph('--- Short Questions (2-3 Marks) ---', true);
    studyPack.examNotes.shortQuestions.forEach((sq) => {
      addParagraph(`${sq.question} [${sq.marks} Marks]`, true, 1);
      addParagraph(`Model Answer: ${sq.answer}`, false, 1);
    });

    addParagraph('--- Long Questions (7 Marks) ---', true);
    studyPack.examNotes.longQuestions.forEach((lq) => {
      addParagraph(`${lq.question} [${lq.marks} Marks]`, true, 1);
      addParagraph('Answer Structure Outline:', true, 2);
      lq.outline.forEach((o) => {
        addParagraph(`• ${o}`, false, 2);
      });
    });
  }

  // 6. Revision Plan
  if (isFull || selectedFeatures.includes('revision_plan')) {
    addHeading('6. Personal Revision Timeline');
    studyPack.revisionPlan.days.forEach((day) => {
      addParagraph(`${day.dateStr}: ${day.topic} [Duration: ${day.duration}]`, true);
      day.tasks.forEach((t) => {
        addParagraph(`[ ] ${t}`, false, 1);
      });
    });
  }

  // 7. Active Recall
  if (isFull || selectedFeatures.includes('active_recall')) {
    addHeading('7. Active Recall Mode');
    studyPack.activeRecall.forEach((ar, idx) => {
      addParagraph(`Q${idx + 1} (${ar.concept}): ${ar.question}`, true);
      addParagraph(`Hint: ${ar.hint}`, false, 1);
      addParagraph(`Answer: ${ar.answer}`, false, 1);
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'notes2quiz-pack.docx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
