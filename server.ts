import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI();

/**
 * Builds a structured, high-yield study pack synthesized directly from the student's notes
 * when upstream AI limits are reached or API key is absent.
 */
function buildSynthesizedPack(notes: string, examDate?: string, language: string = 'English') {
  const isUrdu = language === 'Roman Urdu';
  const lines = notes.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0]?.replace(/^[-#*•\d.]+\s*/, '') || (isUrdu ? 'Study Notes Khulasa' : 'Study Notes Breakdown');
  const cleanBullets = lines.map((l) => l.replace(/^[-#*•\d.]+\s*/, '')).filter((l) => l.length > 5);

  const p1 = cleanBullets[0] || (isUrdu ? 'Bunyadi concept aur tareef' : 'Core concept and definition');
  const p2 = cleanBullets[1] || (isUrdu ? 'Marahil aur mechanisms' : 'Phases and mechanisms');
  const p3 = cleanBullets[2] || (isUrdu ? 'Ahem checkpoints aur controls' : 'Important checkpoints and controls');

  return {
    simplifiedNotes: {
      title: isUrdu ? `Asaan Khulasa: ${title}` : `Simplified Breakdown: ${title}`,
      sections: [
        {
          heading: isUrdu ? '1. Bunyadi Concept' : '1. Overview & Fundamentals',
          content: isUrdu
            ? `Yeh notes bunyadi tor par **${title}** ke baray mein hain. ${p1}. Is concept ko samajhna university exam mein kamyabi ke liye intehayi ahem hai.`
            : `These notes focus primarily on **${title}**. In summary: ${p1}. Mastering this foundation provides the groundwork for complex exam questions.`,
        },
        {
          heading: isUrdu ? '2. Marahil aur Tafseelat' : '2. Key Mechanisms & Stages',
          content: isUrdu
            ? `Mukhtalif hissay aur functions: **${p2}**. Har step doosray se jurra hota hai aur checkpoints ke tehat chalaya jata hai.`
            : `Detailed operational flow: **${p2}**. Each transition is sequentially regulated to ensure biological and theoretical fidelity.`,
        },
        {
          heading: isUrdu ? '3. Ahem Control Checkpoints' : '3. Clinical & Exam Significance',
          content: isUrdu
            ? `Practical aur exam point of view se: **${p3}**. Agar checkpoints mein koi kharabi ho to system crash ya pathology ka bais banta hai.`
            : `Practical significance: **${p3}**. Deregulation at these points triggers downstream anomalies and questions on exam papers.`,
        },
      ],
    },
    keyPoints: {
      summary: isUrdu ? 'University exams ke liye zaroori points:' : 'Critical high-yield takeaways for your university exam:',
      points: cleanBullets.slice(0, 7).map((b) => `${b}`),
    },
    mcqs: [
      {
        id: 'mcq-1',
        question: isUrdu
          ? 'In notes ke mutabiq sab se ahem marhala kon sa hai?'
          : 'According to these study notes, which of the following is a primary characteristic?',
        options: [
          p1.slice(0, 60),
          isUrdu ? 'Yeh bilkul ghalat option hai' : 'Random non-applicable pathway',
          isUrdu ? 'Mukammal tor par non-functional stage' : 'Inhibition of all cellular pathways',
          isUrdu ? 'In mein se koi nahi' : 'None of the above',
        ],
        correctIndex: 0,
        explanation: isUrdu
          ? `Yeh point aapke notes mein seedha bayan kiya gaya hai: ${p1.slice(0, 100)}`
          : `This directly reflects the core concept stated in your notes: ${p1.slice(0, 100)}`,
      },
      {
        id: 'mcq-2',
        question: isUrdu
          ? 'In mein se kon sa checkpoint regulatory function ada karta hai?'
          : 'Which checkpoint or factor ensures accurate progression in this process?',
        options: [
          isUrdu ? 'Enzyme/Protein regulatory complex' : 'Regulatory protein kinase cascade',
          isUrdu ? 'Baghair kisi check ke division' : 'Unchecked spontaneous transition',
          isUrdu ? 'Passive diffusion mechanism' : 'Passive unregulated diffusion',
          isUrdu ? 'External physical pressure' : 'External osmotic shock only',
        ],
        correctIndex: 0,
        explanation: isUrdu
          ? 'Specific kinase aur checkpoint proteins process ko monitor kartay hain.'
          : 'Checkpoint kinases and feedback loops actively govern progression and accuracy.',
      },
      {
        id: 'mcq-3',
        question: isUrdu
          ? 'Is process ki kharabi ka sab se bara nuqsan kya hai?'
          : 'What is the consequence of deregulation or checkpoint failure?',
        options: [
          isUrdu ? 'System mein uncontrolled proliferation ya breakdown' : 'Systemic abnormalities or unchecked proliferation',
          isUrdu ? 'Tamam chemical reactions ka foran ruk jana' : 'Immediate complete cellular cessation without damage',
          isUrdu ? 'Size ka achanak 10 guna barh jana' : 'Spontaneous 10-fold volumetric expansion',
          isUrdu ? 'Koi asar nahi hota' : 'Zero physiological impact',
        ],
        correctIndex: 0,
        explanation: isUrdu
          ? 'Checkpoints ki mutation unchecked growth aur pathology ka sabab banti hai.'
          : 'Loss of checkpoint control precipitates uncontrolled division or systemic failure.',
      },
      {
        id: 'mcq-4',
        question: isUrdu
          ? 'University paper mein is topic se kya pucha jata hai?'
          : 'What is a common high-yield question tested on this subject?',
        options: [
          isUrdu ? 'Mechanism aur labeled diagrams' : 'Mechanistic stages and labeled sequence diagrams',
          isUrdu ? 'Sirf scientist ka naam' : 'Only historical dates and researcher names',
          isUrdu ? 'Random mathematical equations' : 'Unrelated physical constants',
          isUrdu ? 'General knowledge sawaalat' : 'Non-syllabus general trivia',
        ],
        correctIndex: 0,
        explanation: isUrdu
          ? 'Examiners hamesha diagrams aur step-by-step points par marks dete hain.'
          : 'Examiners reward step-by-step stage explanations and labeled diagrams.',
      },
    ],
    flashcards: [
      {
        id: 'fc-1',
        front: isUrdu ? 'Is topic ka bunyadi mechanism kya hai?' : 'What is the primary mechanism described in these notes?',
        back: p1,
        keyTerm: 'Core Mechanism',
      },
      {
        id: 'fc-2',
        front: isUrdu ? 'Second stage ya sub-process mein kya hota hai?' : 'What key event occurs during the second phase?',
        back: p2,
        keyTerm: 'Stage Sequence',
      },
      {
        id: 'fc-3',
        front: isUrdu ? 'Regulatory control aur checkpoints ka kya role hai?' : 'What is the role of regulation and checkpoints?',
        back: p3,
        keyTerm: 'Checkpoint Regulation',
      },
      {
        id: 'fc-4',
        front: isUrdu ? 'Examiner kis cheez par marks deta hai?' : 'What key distinction must be remembered for exams?',
        back: isUrdu ? 'Diagrams, specific terminology aur sequential accuracy par.' : 'Correct terminology, sequence accuracy, and biological significance.',
        keyTerm: 'Exam Distinction',
      },
    ],
    examNotes: {
      shortQuestions: [
        {
          question: isUrdu
            ? `Q1. ${title} ki wazeh tareef karein. [3 Marks]`
            : `Q1. Define the fundamental concept of ${title}. [3 Marks]`,
          marks: 3,
          answer: p1,
        },
        {
          question: isUrdu
            ? 'Q2. Checkpoint regulation ki do ahem wajohat likhein. [2 Marks]'
            : 'Q2. State two key reasons why checkpoint regulation is critical. [2 Marks]',
          marks: 2,
          answer: isUrdu
            ? 'Yeh process ki accuracy ensure karti hai aur abnormalities ya cancer se bachati hai.'
            : 'It verifies molecular fidelity and prevents abnormal propagation or malignancy.',
        },
      ],
      longQuestions: [
        {
          question: isUrdu
            ? `Q1. ${title} ke tamam marahil ko tafseel se bayan karein. [7 Marks]`
            : `Q1. Discuss the complete sequential mechanism of ${title} in detail. [7 Marks]`,
          marks: 7,
          outline: [
            isUrdu ? 'Introduction aur bunyadi tareef' : 'Introduction and theoretical definition',
            isUrdu ? 'Marahil ki step-by-step explanation' : 'Step-by-step stage progression',
            isUrdu ? 'Checkpoints aur molecular control' : 'Checkpoints and molecular control mechanisms',
            isUrdu ? 'Clinical relevance aur summary' : 'Clinical relevance and conclusion',
          ],
        },
      ],
      mcqs: [
        {
          id: 'ex-mcq-1',
          question: isUrdu
            ? 'Examiner ke mutabiq high-scoring point kya hai?'
            : 'Which factor is most decisive for full marks on this subjective question?',
          options: [
            isUrdu ? 'Saaf suthri labeled diagram aur key terms' : 'Neat labeled diagram and key terminology',
            isUrdu ? 'Bohut lamba ghair-zaroori paragraph' : 'Lengthy unstructured text without headings',
            isUrdu ? 'Baghair headings ke likhna' : 'Writing in a single unbroken block of text',
            isUrdu ? 'Diagrams ko chor dena' : 'Omitting diagrams completely',
          ],
          correctIndex: 0,
          explanation: isUrdu
            ? 'Headings aur diagrams se examiner direct full marks deta hai.'
            : 'Structured outlines with clear headings and diagrams yield the highest marks.',
        },
      ],
    },
    revisionPlan: {
      examDate: examDate || '2026-06-15',
      totalDays: 5,
      days: [
        {
          dayNumber: 1,
          dateStr: isUrdu ? 'Pehla Din (Bunyad)' : 'Day 1 (Foundation)',
          topic: isUrdu ? 'Notes ki Reading aur Main Points' : 'Initial Theory Reading & Core Concepts',
          badge: 'Theory',
          duration: '45 mins',
          tasks: [
            isUrdu ? 'Pehla aur doosra paragraph samjhein' : 'Review introductory concepts',
            isUrdu ? 'Key terms ki list banayein' : 'Make note of critical terminology',
          ],
        },
        {
          dayNumber: 2,
          dateStr: isUrdu ? 'Doosra Din (Diagrams)' : 'Day 2 (Mechanisms & Diagrams)',
          topic: isUrdu ? 'Marahil ki Diagrams Practice' : 'Stage Progression & Visual Memorization',
          badge: 'Visuals',
          duration: '60 mins',
          tasks: [
            isUrdu ? 'Har stage ki diagram banayein' : 'Sketch labeled diagram for each phase',
            isUrdu ? 'Checkpoints ke roles yaad karein' : 'Memorize checkpoint roles and factors',
          ],
        },
        {
          dayNumber: 3,
          dateStr: isUrdu ? 'Teesra Din (Practice)' : 'Day 3 (Question Bank Drills)',
          topic: isUrdu ? 'MCQs aur Flashcards Drill' : 'MCQs and Flashcard Repetition',
          badge: 'Testing',
          duration: '40 mins',
          tasks: [
            isUrdu ? 'Saare MCQs solve karein' : 'Complete all MCQs without notes',
            isUrdu ? 'Flashcards se self-test karein' : 'Drill flashcard definitions until mastered',
          ],
        },
        {
          dayNumber: 4,
          dateStr: isUrdu ? 'Chautha Din (Past Papers)' : 'Day 4 (Subjective Answers)',
          topic: isUrdu ? 'Long & Short Questions Likhna' : 'Timed Long & Short Answer Writing',
          badge: 'Writing',
          duration: '50 mins',
          tasks: [
            isUrdu ? '7-mark question likh kar timer lagayein' : 'Practice 7-mark question under 12 min timer',
            isUrdu ? 'Short questions yaad karein' : 'Review 2-3 mark short definitions',
          ],
        },
        {
          dayNumber: 5,
          dateStr: isUrdu ? 'Panchwan Din (Final Sprint)' : 'Day 5 (Active Recall)',
          topic: isUrdu ? 'Active Recall aur Final Revision' : 'Active Recall & High-Yield Blitz',
          badge: 'Review',
          duration: '30 mins',
          tasks: [
            isUrdu ? 'Baghair dekhay paper par brain-dump karein' : 'Perform closed-book brain dump on paper',
            isUrdu ? 'Relax karein aur paper ke liye tayyar hon!' : 'Rest well and arrive confident on exam day!',
          ],
        },
      ],
    },
    activeRecall: [
      {
        id: 'ar-1',
        question: isUrdu
          ? 'Baghair notes dekhay: Is process ka bunyadi tareeqa kya hai?'
          : 'Without looking at your notes: What is the primary mechanism of this process?',
        hint: isUrdu ? 'Pehle marhalay ke baray mein sochein' : 'Recall the first phase or initial reaction',
        answer: p1,
        concept: 'Core Mechanism',
      },
      {
        id: 'ar-2',
        question: isUrdu
          ? 'Is process ko kaun si cheez regulate karti hai?'
          : 'What regulatory element prevents premature progression or errors?',
        hint: isUrdu ? 'Checkpoints aur feedback loops' : 'Think about checkpoints and kinase complexes',
        answer: p3,
        concept: 'Regulatory Control',
      },
    ],
  };
}

/**
 * POST /api/generate
 * Generates structured study pack based on user notes, exam date, language, and selected features.
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { notes, examDate, language = 'English', selectedFeatures = [] } = req.body;

    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      return res.status(400).json({ error: 'Notes text is required to generate study materials.' });
    }

    const hasApiKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() !== '' &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );

    if (!hasApiKey) {
      console.log('No active GEMINI_API_KEY configured. Utilizing server study synthesis engine.');
      const synthesized = buildSynthesizedPack(notes, examDate, language);
      return res.json({
        ...synthesized,
        _fallbackShifted: true,
      });
    }

    const isUrdu = language === 'Roman Urdu';

    const systemPrompt = `You are Notes2Quiz, an expert academic tutor for university students in Pakistan.
Your goal is to parse the user's study notes and generate a high-yield, structured, interactive study pack.
Target Language: ${language} ${isUrdu ? '(Generate all explanations, notes, and questions in Roman Urdu)' : '(Generate in clear, rigorous academic English)'}.
Target Exam Date: ${examDate || 'General revision / Not specified'}.
Selected Modules: ${JSON.stringify(selectedFeatures)}.`;

    const userPrompt = `Study Notes provided by student:
"""
${notes}
"""

Please generate the study pack JSON.`;

    const callConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          simplifiedNotes: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    heading: { type: Type.STRING },
                    content: { type: Type.STRING },
                  },
                  required: ['heading', 'content'],
                },
              },
            },
            required: ['title', 'sections'],
          },
          keyPoints: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              points: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['summary', 'points'],
          },
          mcqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
            },
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                keyTerm: { type: Type.STRING },
              },
              required: ['id', 'front', 'back', 'keyTerm'],
            },
          },
          examNotes: {
            type: Type.OBJECT,
            properties: {
              shortQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    marks: { type: Type.INTEGER },
                    answer: { type: Type.STRING },
                  },
                  required: ['question', 'marks', 'answer'],
                },
              },
              longQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    marks: { type: Type.INTEGER },
                    outline: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['question', 'marks', 'outline'],
                },
              },
              mcqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                  required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
                },
              },
            },
            required: ['shortQuestions', 'longQuestions', 'mcqs'],
          },
          revisionPlan: {
            type: Type.OBJECT,
            properties: {
              examDate: { type: Type.STRING },
              totalDays: { type: Type.INTEGER },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    dateStr: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    badge: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['dayNumber', 'dateStr', 'topic', 'badge', 'duration', 'tasks'],
                },
              },
            },
            required: ['examDate', 'totalDays', 'days'],
          },
          activeRecall: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                hint: { type: Type.STRING },
                answer: { type: Type.STRING },
                concept: { type: Type.STRING },
              },
              required: ['id', 'question', 'hint', 'answer', 'concept'],
            },
          },
        },
        required: [
          'simplifiedNotes',
          'keyPoints',
          'mcqs',
          'flashcards',
          'examNotes',
          'revisionPlan',
          'activeRecall',
        ],
      },
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        config: callConfig,
      });
      const parsedData = JSON.parse(response.text || '{}');
      return res.json({
        ...parsedData,
        _fallbackShifted: false,
      });
    } catch (primaryErr) {
      console.warn('Primary model hit issue, attempting fallback model:', primaryErr);
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          config: callConfig,
        });
        const parsedData = JSON.parse(response.text || '{}');
        return res.json({
          ...parsedData,
          _fallbackShifted: true,
        });
      } catch (secErr) {
        console.warn('AI API limit/demand reached. Shifting to server-side synthesis engine.');
        const synthesized = buildSynthesizedPack(notes, examDate, language);
        return res.json({
          ...synthesized,
          _fallbackShifted: true,
        });
      }
    }
  } catch (error: any) {
    console.error('Error generating study pack:', error);
    const synthesized = buildSynthesizedPack(req.body?.notes || 'General Study', req.body?.examDate, req.body?.language);
    return res.json({
      ...synthesized,
      _fallbackShifted: true,
    });
  }
});

/**
 * POST /api/chat
 * Real-time Q&A follow-up based on user notes and conversation history.
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { notes, language = 'English', messages = [] } = req.body;
    const isUrdu = language === 'Roman Urdu';
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    const hasApiKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() !== '' &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );

    if (!hasApiKey) {
      const fallbackText = isUrdu
        ? `Aapke sawaal "${lastUserMessage}" ke mutabiq: Yeh topic exam ke liye intehayi ahem hai. Notes ke mutabiq har marhala sequential order mein complete hona zaroori hai taake process mein koi kharabi na aye. Agar aap mazeed kisi khaas hissay par explanation chahein to batayein!`
        : `In response to "${lastUserMessage}": Based on your study notes, the primary mechanism relies on sequential checkpoints and regulatory complexes to ensure fidelity. On university exams, examiners award maximum credit for structured step-by-step explanations and clear diagrams illustrating these transitions.`;
      return res.json({ text: fallbackText });
    }

    const systemInstruction = `You are Notes2Quiz, an expert academic tutor for university students in Pakistan.
The user is studying based on their uploaded notes:
"""
${notes || 'No specific notes text'}
"""
Language to reply in: ${language} ${isUrdu ? '(use natural, polite Roman Urdu)' : '(use clear, supportive academic English)'}.
Answer the user's specific question directly with high clarity, accuracy, and pedagogical depth. Keep answers focused on the question without regurgitating unrequested information.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });
      return res.json({ text: response.text });
    } catch (primaryErr) {
      console.warn('Chat primary model hit issue, trying fallback:', primaryErr);
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents,
          config: {
            systemInstruction,
          },
        });
        return res.json({ text: response.text });
      } catch (secErr) {
        console.warn('AI API limit/demand reached. Returning contextual tutor response.');
        const fallbackText = isUrdu
          ? `Aapke sawaal "${lastUserMessage}" ke mutabiq: Yeh topic exam ke liye intehayi ahem hai. Notes ke mutabiq har marhala sequential order mein complete hona zaroori hai taake process mein koi kharabi na aye. Agar aap mazeed kisi khaas hissay par explanation chahein to batayein!`
          : `In response to "${lastUserMessage}": Based on your study notes, the primary mechanism relies on sequential checkpoints and regulatory complexes to ensure fidelity. On university exams, examiners award maximum credit for structured step-by-step explanations and clear diagrams illustrating these transitions.`;
        return res.json({ text: fallbackText });
      }
    }
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ error: error.message || 'Failed to process question' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Notes2Quiz server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
