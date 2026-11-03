/**
 * Mock study pack data for Notes2Quiz
 * Based on undergraduate biology: "Cell Division, Mitosis and the Cell Cycle"
 * Includes both English and Roman Urdu editions for university students in Pakistan.
 * 
 * TODO: In production, replace this static generator with a real backend API call
 * to Gemini (e.g. POST /api/generate-pack with prompt, notesText, language, and selectedFeatures).
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

export const MOCK_STUDY_PACK_EN: StudyPackData = {
  simplifiedNotes: {
    title: "Simplified Breakdown: Cell Cycle & Mitosis",
    sections: [
      {
        heading: "1. What is the Cell Cycle?",
        content:
          "Think of the cell cycle as a cell's complete lifespan. Most of its life is spent in **Interphase**, where the cell eats, grows, and makes an identical photocopy of its DNA during the **S-phase**. Only a small window is dedicated to **Mitosis (M-Phase)**, which is the actual division of the cell nucleus.",
      },
      {
        heading: "2. The Four Stages of Mitosis (P-M-A-T)",
        content:
          "Remember the mnemonic **PMAT**:\n• **Prophase (Prepare)**: Chromosomes pack tightly into visible X-shapes, and the nuclear wall dissolves.\n• **Metaphase (Middle)**: Chromosomes line up precisely along the center equator (metaphase plate).\n• **Anaphase (Away)**: Sister chromatids snap apart at the centromere and get dragged to opposite ends of the cell.\n• **Telophase (Two nuclei)**: Two new nuclear membranes reform around the separated DNA.",
      },
      {
        heading: "3. Cytokinesis & Medical Relevance",
        content:
          "Following mitosis, **Cytokinesis** slices the physical cell into two daughter cells. When checkpoint proteins (like **p53** and **Cyclin-CDK complexes**) malfunction, cells divide uncontrollably, which is the biological root of malignant **cancer**.",
      },
    ],
  },
  keyPoints: {
    summary: "Critical high-yield takeaways for your university exam:",
    points: [
      "The cell cycle is split into **Interphase (G1, S, G2)** and **M-Phase (Mitosis + Cytokinesis)**.",
      "**DNA replication** occurs strictly in the **S-phase** (chromosome count remains 2n, chromatid count doubles).",
      "**Prophase**: Chromatin condenses, nucleolus disappears, and the mitotic spindle forms.",
      "**Metaphase**: Chromosomes line up at the equatorial plate; spindle fibers bind to **kinetochores**.",
      "**Anaphase**: Sister chromatids separate and move to opposite poles — shortest phase of mitosis.",
      "**Telophase**: Nuclear envelope reforms; chromosomes decondense back to loose chromatin.",
      "**Cytokinesis difference**: Animal cells use an **actin cleavage furrow**; plant cells build a **cell plate** via Golgi vesicles.",
      "**Clinical correlation**: Mutation in checkpoint gene **p53** leads to uncontrolled mitosis and tumor formation.",
    ],
  },
  mcqs: [
    {
      id: "mcq-1",
      question: "In which sub-phase of Interphase does DNA replication occur?",
      options: ["G1 Phase", "S Phase", "G2 Phase", "G0 Phase"],
      correctIndex: 1,
      explanation: "DNA replication and duplication of chromosomes occur strictly during the Synthesis (S) phase of Interphase.",
    },
    {
      id: "mcq-2",
      question: "At which mitotic stage do chromosomes align along the equatorial plate?",
      options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
      correctIndex: 1,
      explanation: "During Metaphase (M for 'Middle'), chromosomes are aligned at the metaphase plate via spindle fibers attached to kinetochores.",
    },
    {
      id: "mcq-3",
      question: "What physical mechanism achieves cytokinesis in plant cells?",
      options: [
        "Actin-myosin contractile ring",
        "Cell plate formation via Golgi-derived vesicles",
        "Centriolar pinching",
        "Direct nuclear fission",
      ],
      correctIndex: 1,
      explanation: "Because plant cells have rigid cellulose walls, they cannot pinch; instead, Golgi vesicles coalesce into a cell plate at the center.",
    },
    {
      id: "mcq-4",
      question: "A mutation in the p53 gene often causes cancer because it leads to:",
      options: [
        "Failure of DNA polymerase in G1",
        "Loss of cell cycle checkpoint control and unchecked mitosis",
        "Inability to form spindle fibers",
        "Permanent arrest in G0 phase",
      ],
      correctIndex: 1,
      explanation: "p53 is known as the 'guardian of the genome'; its loss fails to arrest damaged cells, allowing uninhibited mitotic division.",
    },
  ],
  flashcards: [
    {
      id: "fc-1",
      front: "What is the primary event during the S-phase of Interphase?",
      back: "DNA replication. The DNA content doubles (2C → 4C) while the chromosome count remains diploid (2n).",
      keyTerm: "S-Phase (Synthesis)",
    },
    {
      id: "fc-2",
      front: "What is a Kinetochore and what does it do in Metaphase?",
      back: "A protein complex on the centromere of each chromosome where spindle microtubules bind to pull chromatids apart.",
      keyTerm: "Kinetochore",
    },
    {
      id: "fc-3",
      front: "How does Cytokinesis differ between animal and plant cells?",
      back: "Animal cells form an actin-myosin cleavage furrow from the outside in. Plant cells build a pectin-rich cell plate from the inside out.",
      keyTerm: "Cytokinesis Contrast",
    },
    {
      id: "fc-4",
      front: "What happens during Anaphase?",
      back: "Centromeres split and sister chromatids separate into individual daughter chromosomes, migrating toward opposite poles.",
      keyTerm: "Anaphase",
    },
  ],
  examNotes: {
    shortQuestions: [
      {
        question: "Q1. Define the G0 phase (quiescent stage) and give two examples of cells in it.",
        marks: 3,
        answer:
          "The G0 phase is a non-dividing, metabolically active state where cells exit the cell cycle. Examples include mature neurons and cardiac muscle cells.",
      },
      {
        question: "Q2. Differentiate between karyokinesis and cytokinesis.",
        marks: 2,
        answer:
          "Karyokinesis is the division of the cell nucleus (Mitosis/Meiosis), whereas cytokinesis is the physical division of the cytoplasm and organelles into two daughter cells.",
      },
      {
        question: "Q3. What is the significance of the G2/M checkpoint?",
        marks: 3,
        answer:
          "It ensures all DNA has been fully and accurately replicated without damage before permitting entry into Mitosis, mediated by Cyclin B-CDK1 (MPF).",
      },
    ],
    longQuestions: [
      {
        question: "Q1. Explain the four stages of Mitosis in detail with well-labeled event breakdowns. (7 Marks)",
        marks: 7,
        outline: [
          "Introduction: Definition of mitosis (equational division) and cellular role.",
          "Prophase: Chromatin compaction, breakdown of nuclear lamina, spindle apparatus creation.",
          "Metaphase: Metaphase plate alignment, tension equilibrium between opposing kinetochores.",
          "Anaphase: Proteolytic cleavage of cohesin, poleward translocation of sister chromatids.",
          "Telophase: Decondensation, reformation of nuclear envelopes, nucleolus re-emergence.",
          "Conclusion: Transition into cytokinesis and generation of two identical 2n cells.",
        ],
      },
      {
        question: "Q2. Describe the molecular checkpoints of the cell cycle and discuss how deregulation causes carcinogenesis. (7 Marks)",
        marks: 7,
        outline: [
          "G1/S Checkpoint (Restriction point): Role of Rb protein, E2F transcription factor, and Cyclin D/CDK4.",
          "G2/M Checkpoint: Role of ATM/ATR kinases and p53 in detecting double-strand DNA breaks.",
          "Spindle Assembly Checkpoint (SAC): Verification of bi-oriented chromosome attachment in metaphase.",
          "Pathology: Loss of p53 tumor suppressor leads to genomic instability and unconstrained tumor proliferation.",
        ],
      },
    ],
    mcqs: [
      {
        id: "ex-mcq-1",
        question: "Cohesin degradation at the onset of Anaphase is triggered by which enzyme?",
        options: ["DNA Ligase", "Separase", "Caspase-3", "Topoisomerase II"],
        correctIndex: 1,
        explanation: "Separase cleaves cohesin rings after securin is degraded by the APC/C complex, allowing chromatid disjunction.",
      },
    ],
  },
  revisionPlan: {
    examDate: "2026-06-15",
    totalDays: 5,
    days: [
      {
        dayNumber: 1,
        dateStr: "Day 1 (Foundation)",
        topic: "Interphase Deep Dive & Cell Cycle Control",
        badge: "Theory",
        duration: "45 mins",
        tasks: ["Review G1, S, and G2 phases", "Diagram DNA replication timing", "Memorize Cyclin-CDK checkpoints"],
      },
      {
        dayNumber: 2,
        dateStr: "Day 2 (Mechanism)",
        topic: "Mitosis PMAT Sequence & Spindle Dynamics",
        badge: "Visuals",
        duration: "60 mins",
        tasks: ["Sketch all 4 stages of Mitosis", "Practice kinetochore vs polar microtubule roles", "Contrast plant vs animal cytokinesis"],
      },
      {
        dayNumber: 3,
        dateStr: "Day 3 (Active Testing)",
        topic: "MCQs & Flashcard Drills",
        badge: "Practice",
        duration: "40 mins",
        tasks: ["Complete all 15 question bank MCQs without notes", "Test yourself on 10 terminology flashcards", "Review wrong answer explanations"],
      },
      {
        dayNumber: 4,
        dateStr: "Day 4 (Past Paper Prep)",
        topic: "Short & Long Subjective Questions",
        badge: "Past Papers",
        duration: "60 mins",
        tasks: ["Write 7-mark subjective answer for Mitosis stages under 12 min timer", "Memorize 3-mark checkpoint questions"],
      },
      {
        dayNumber: 5,
        dateStr: "Day 5 (Final Sprint)",
        topic: "Active Recall & Speed Blitz",
        badge: "Review",
        duration: "30 mins",
        tasks: ["Perform closed-book brain dump on blank paper", "Brush up high-yield terms (p53, separase, kinetochore)", "Rest well before exam day!"],
      },
    ],
  },
  activeRecall: [
    {
      id: "ar-1",
      question: "Without looking at your notes: What exact chromosome and chromatid numbers exist in human cells during G1 versus G2?",
      hint: "Remember: DNA duplicates in S-phase, but centromere count stays constant.",
      answer: "In G1: 46 chromosomes (2n) with 46 chromatids (2C). In G2: 46 chromosomes (2n) with 92 sister chromatids (4C).",
      concept: "Ploidy & Chromosome Count",
    },
    {
      id: "ar-2",
      question: "What is the biochemical signal that allows sister chromatids to suddenly separate at the start of Anaphase?",
      hint: "Think about the APC/C complex and the enzyme that cuts cohesin.",
      answer: "The Anaphase-Promoting Complex (APC/C) activates Separase by destroying Securin. Separase then degrades the Cohesin proteins holding chromatids together.",
      concept: "Anaphase Initiation",
    },
    {
      id: "ar-3",
      question: "Why can't plant cells undergo cytokinesis using a cleavage furrow like animal cells do?",
      hint: "Think about the outer layer present in plant cells.",
      answer: "Plant cells are enclosed by a rigid cellulose cell wall that cannot be indented or pinched inward. Instead, they must build a new cell plate from the center outward.",
      concept: "Plant Cytokinesis",
    },
    {
      id: "ar-4",
      question: "Explain why p53 is called the 'guardian of the genome' in the context of the cell cycle.",
      hint: "What happens when DNA damage is found in G1?",
      answer: "p53 arrests the cell cycle at the G1/S checkpoint to allow DNA repair by transcribing p21 (a CDK inhibitor). If the damage is beyond repair, p53 triggers programmed cell death (apoptosis).",
      concept: "Checkpoint Regulation",
    },
  ],
};

export const MOCK_STUDY_PACK_UR: StudyPackData = {
  simplifiedNotes: {
    title: "Asaan Khulasa: Cell Cycle aur Mitosis (Roman Urdu)",
    sections: [
      {
        heading: "1. Cell Cycle Kya Hai?",
        content:
          "Cell cycle asal mein ek cell ki poori zindagi ka safar hai. Iska zyadatar waqt **Interphase** mein guzarta hai jahan cell bara hota hai aur **S-Phase** mein apna DNA double (copy) karta hai. Iske baad **Mitosis (M-Phase)** shuru hota hai jahan cell divide hota hai.",
      },
      {
        heading: "2. Mitosis Ke Chaar Marahil (P-M-A-T)",
        content:
          "Isko yaad rakhne ka tareeqa hai **PMAT**:\n• **Prophase**: Chromosomes condensed ho kar wazeh ho jate hain aur nuclear membrane khatam ho jati hai.\n• **Metaphase**: Saare chromosomes cell ke darmiyan (equator) par line bana kar khare ho jate hain.\n• **Anaphase**: Sister chromatids alag ho kar opposite konon ki taraf khinchte hain.\n• **Telophase**: Dono sides par nayi nuclear membranes ban jati hain.",
      },
      {
        heading: "3. Cytokinesis Aur Cancer Ka Taluq",
        content:
          "Mitosis ke baad **Cytokinesis** cell ko physically do hisson mein taqseem karta hai. Agar cell cycle ke checkpoints (jaise **p53 protein**) kharab ho jayein, to cell be-qaboo divide hona shuru kar deta hai, jise hum **cancer ya tumor** kehte hain.",
      },
    ],
  },
  keyPoints: {
    summary: "University exams ke liye zaroori points:",
    points: [
      "Cell cycle do hisson par mushtamil hai: **Interphase** aur **M-Phase (Mitosis)**.",
      "**DNA Replication** sirf aur sirf **S-Phase** ke doraan hoti hai.",
      "**Prophase**: Chromosomes visible bante hain aur spindle fibers form hote hain.",
      "**Metaphase**: Chromosomes center plate par align hote hain aur spindle kinetochores se judte hain.",
      "**Anaphase**: Sister chromatids separate ho jate hain (ye sab se chota phase hai).",
      "**Telophase**: Naye nuclei form hote hain aur chromosomes decondense hote hain.",
      "**Cytokinesis**: Animal cells mein cleavage furrow banta hai, jabkay plant cells mein **cell plate** banti hai.",
      "**Medical Point**: **p53 gene** ki mutation ki wajah se unchecked division hoti hai jo cancer ka bais banti hai.",
    ],
  },
  mcqs: [
    {
      id: "mcq-ur-1",
      question: "Cell cycle ke kis phase mein DNA replication mukammal hoti hai?",
      options: ["G1 Phase", "S Phase", "G2 Phase", "G0 Phase"],
      correctIndex: 1,
      explanation: "DNA ki duplication sirf Synthesis (S) phase mein hoti hai.",
    },
    {
      id: "mcq-ur-2",
      question: "Chromosomes cell ke center (equator) par kis stage mein arrange hote hain?",
      options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
      correctIndex: 1,
      explanation: "Metaphase mein spindle fibers chromosomes ko metaphase plate par le aate hain.",
    },
    {
      id: "mcq-ur-3",
      question: "Plant cells mein cytokinesis kis tarah hoti hai?",
      options: [
        "Cleavage furrow ke zariye",
        "Cell plate formation ke zariye",
        "Direct pinching ke zariye",
        "Spindle breakdown ke zariye",
      ],
      correctIndex: 1,
      explanation: "Plant cells ki rigid wall ki wajah se Golgi vesicles center mein jud kar cell plate banate hain.",
    },
  ],
  flashcards: [
    {
      id: "fc-ur-1",
      front: "S-Phase mein kya ahem tabdeeli aati hai?",
      back: "DNA content double ho jata hai (2C se 4C), lekin chromosome count (2n) wohi rehta hai.",
      keyTerm: "S-Phase DNA Copy",
    },
    {
      id: "fc-ur-2",
      front: "Kinetochore ka bunyadi function kya hai?",
      back: "Centromere par mojood protein structure jahan spindle fibers attach ho kar chromatids ko khinchte hain.",
      keyTerm: "Kinetochore Function",
    },
    {
      id: "fc-ur-3",
      front: "p53 ko 'Guardian of the Genome' kyun kaha jata hai?",
      back: "Kyunkay ye damaged DNA walay cells ko roktii hai aur agar repair na ho sake to apoptosis (cell death) trigger karti hai.",
      keyTerm: "p53 Tumor Suppressor",
    },
  ],
  examNotes: {
    shortQuestions: [
      {
        question: "Q1. G0 phase kya hai aur iski koi do misalein dein? (3 Marks)",
        marks: 3,
        answer:
          "G0 phase ek aisi stage hai jahan cell divide hona band kar deta hai lekin metabolically active rehta hai. Misalein: Mature neurons aur heart muscle cells.",
      },
      {
        question: "Q2. Karyokinesis aur Cytokinesis mein kya farq hai? (2 Marks)",
        marks: 2,
        answer:
          "Karyokinesis nucleus ki division ko kehte hain, jabkay Cytokinesis cytoplasm aur poore cell ki division ko kehte hain.",
      },
    ],
    longQuestions: [
      {
        question: "Q1. Mitosis ke chaaron marahil (PMAT) ko tafseel se bayan karein. (7 Marks)",
        marks: 7,
        outline: [
          "Mitosis ki tareef aur ahmiyat.",
          "Prophase: Chromosome condensation aur spindle formation.",
          "Metaphase: Equator par alignment aur kinetochore attachment.",
          "Anaphase: Sister chromatids ki separation.",
          "Telophase: Nayi nuclear membrane aur nucleoli ki tashkeel.",
          "Cytokinesis ka mukhtasir jaiza.",
        ],
      },
    ],
    mcqs: [
      {
        id: "ex-mcq-ur-1",
        question: "Anaphase mein cohesin protein ko kon sa enzyme break karta hai?",
        options: ["Separase", "DNA Ligase", "Amylase", "Polymerase"],
        correctIndex: 0,
        explanation: "Separase enzyme cohesin ko cleave karta hai jis se chromatids alag ho jate hain.",
      },
    ],
  },
  revisionPlan: {
    examDate: "2026-06-15",
    totalDays: 4,
    days: [
      {
        dayNumber: 1,
        dateStr: "Pehla Din",
        topic: "Interphase aur Checkpoints ki Samajh",
        badge: "Theory",
        duration: "45 mins",
        tasks: ["G1, S, aur G2 phases ka note banayein", "DNA replication ka concept samjhein"],
      },
      {
        dayNumber: 2,
        dateStr: "Doosra Din",
        topic: "Mitosis PMAT ki Diagrams",
        badge: "Diagrams",
        duration: "50 mins",
        tasks: ["Chaar marahil ki diagrams practice karein", "Kinetochores ka role samjhein"],
      },
      {
        dayNumber: 3,
        dateStr: "Teesra Din",
        topic: "MCQs & Short Questions Practice",
        badge: "Practice",
        duration: "45 mins",
        tasks: ["Saare MCQs solve karein", "Short questions likh kar yaad karein"],
      },
      {
        dayNumber: 4,
        dateStr: "Chautha Din",
        topic: "Active Recall & Revision Blitz",
        badge: "Final Revision",
        duration: "30 mins",
        tasks: ["Baghair dekhay definitions likhein", "Final revision checklist complete karein"],
      },
    ],
  },
  activeRecall: [
    {
      id: "ar-ur-1",
      question: "Baghair notes dekhay batayein: Plant cells aur Animal cells ki cytokinesis mein kya farq hai?",
      hint: "Plant cell wall ke baray mein sochein.",
      answer: "Animal cells mein actin ring se bahir se andar ki taraf furrow banta hai, jabkay plant cells mein andar se bahir Golgi vesicles se cell plate banti hai.",
      concept: "Cytokinesis Contrast",
    },
    {
      id: "ar-ur-2",
      question: "Mitosis ka sab se chota marhala kon sa hai aur is mein kya hota hai?",
      hint: "Chromatids alag hotay hain.",
      answer: "Anaphase sab se chota marhala hai jahan sister chromatids separate ho kar poles ki taraf move karti hain.",
      concept: "Anaphase Speed",
    },
  ],
};

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
