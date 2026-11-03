/**
 * Type definitions and configuration for Notes2Quiz Study Packs.
 * Real data is dynamically generated via the backend /api/generate endpoint.
 */

export interface MCQItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  keyTerm?: string;
}

export interface ExamNotesSection {
  shortQuestions: { question: string; marks: number; answer: string }[];
  longQuestions: { question: string; marks: number; outline: string[] }[];
  mcqs: MCQItem[];
}

export interface RevisionDay {
  dayNumber: number;
  dateStr: string;
  topic: string;
  badge: string;
  duration: string;
  tasks: string[];
}

export interface ActiveRecallItem {
  id: string;
  question: string;
  hint: string;
  answer: string;
  concept: string;
}

export interface StudyPackData {
  simplifiedNotes: {
    title: string;
    sections: { heading: string; content: string }[];
  };
  keyPoints: {
    summary: string;
    points: string[];
  };
  mcqs: MCQItem[];
  flashcards: FlashcardItem[];
  examNotes: ExamNotesSection;
  revisionPlan: {
    examDate: string;
    totalDays: number;
    days: RevisionDay[];
  };
  activeRecall: ActiveRecallItem[];
}

export const SAMPLE_NOTES = `Cell Division & Mitosis Lecture Notes:
- Cell cycle consists of Interphase (G1, S, G2 phases) and M-Phase (Mitosis + Cytokinesis).
- In Interphase, G1 is cellular growth and protein synthesis; S-phase is DNA replication (chromosome count remains 2n, DNA content doubles from 2C to 4C); G2 prepares cell for mitosis.
- Mitosis has 4 main stages:
  1. Prophase: Chromatin condenses into visible chromosomes, nucleolus disappears, mitotic spindle forms from centrioles, nuclear envelope breaks down.
  2. Metaphase: Chromosomes align along the metaphase plate (equator). Spindle fibers attach to kinetochores of sister chromatids.
  3. Anaphase: Centromeres split; sister chromatids are pulled toward opposite poles by shortening microtubules.
  4. Telophase: Chromatids decondense back into chromatin, nuclear membranes reform around daughter nuclei, spindle dissolves.
- Cytokinesis: Cleavage furrow in animal cells (actin-myosin ring); Cell plate formation in plant cells (Golgi vesicles fuse).
- Significance: Growth, tissue repair, asexual reproduction. Uncontrolled mitosis leads to tumors and cancer due to faulty checkpoints (p53 / cyclins / CDKs).`;

export const FEATURE_CONFIGS = [
  {
    id: "full_package",
    name: "Full Study Package",
    description: "Everything in one comprehensive pack",
    icon: "Layers",
  },
  {
    id: "simplified_notes",
    name: "Simplified Notes",
    description: "Easy-to-read rewrite with core terms",
    icon: "FileText",
  },
  {
    id: "key_points",
    name: "Key Points",
    description: "High-yield bulleted summary",
    icon: "ListChecks",
  },
  {
    id: "mcqs",
    name: "MCQs",
    description: "Practice questions with interactive answers",
    icon: "CheckCircle2",
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Click-to-flip question and answer pairs",
    icon: "Sparkles",
  },
  {
    id: "exam_notes",
    name: "Exam Notes",
    description: "Short + Long questions + MCQs breakdown",
    icon: "GraduationCap",
    isFlagship: true,
  },
  {
    id: "revision_plan",
    name: "Personal Revision Plan",
    description: "Day-by-day schedule based on exam date",
    icon: "Calendar",
  },
  {
    id: "active_recall",
    name: "Active Recall Mode",
    description: "Questions first, answers hidden behind reveal",
    icon: "EyeOff",
  },
];
