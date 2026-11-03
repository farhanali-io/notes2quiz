import { GoogleGenAI } from '@google/genai';

export interface Env {
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function normalizeStudyPack(raw: any, examDate?: string): any {
  const result: any = { ...raw };

  if (typeof raw.simplifiedNotes === 'string') {
    result.simplifiedNotes = {
      title: 'Simplified Notes Overview',
      sections: [{ heading: 'Core Concepts', content: raw.simplifiedNotes }],
    };
  } else if (raw.simplifiedNotes && !raw.simplifiedNotes.sections) {
    result.simplifiedNotes = {
      title: raw.simplifiedNotes.title || 'Simplified Notes',
      sections: [{ heading: 'Summary', content: JSON.stringify(raw.simplifiedNotes) }],
    };
  }

  if (Array.isArray(raw.keyPoints)) {
    result.keyPoints = { summary: 'High-Yield Points', points: raw.keyPoints };
  }

  if (Array.isArray(raw.mcqs)) {
    result.mcqs = raw.mcqs.map((m: any, idx: number) => {
      const options = Array.isArray(m.options) ? m.options : [];
      let correctIndex = typeof m.correctIndex === 'number' ? m.correctIndex : 0;
      if (m.correctAnswer && options.length > 0) {
        const found = options.findIndex(
          (opt: string) => opt.trim().toLowerCase() === String(m.correctAnswer).trim().toLowerCase()
        );
        if (found !== -1) correctIndex = found;
      }
      return {
        id: m.id || `mcq-${idx + 1}`,
        question: m.question || '',
        options,
        correctIndex,
        correctAnswer: m.correctAnswer || options[correctIndex] || '',
        explanation: m.explanation || 'Refer to your study notes for this key concept.',
      };
    });
  }

  if (Array.isArray(raw.flashcards)) {
    result.flashcards = raw.flashcards.map((f: any, idx: number) => ({
      id: f.id || `fc-${idx + 1}`,
      front: f.front || f.question || '',
      back: f.back || f.answer || '',
      keyTerm: f.keyTerm || `Concept ${idx + 1}`,
    }));
  }

  if (raw.examNotes) {
    const sq = Array.isArray(raw.examNotes.shortQuestions)
      ? raw.examNotes.shortQuestions.map((q: any) => ({
          question: q.question || q.q || '',
          marks: q.marks || 3,
          answer: q.answer || q.a || '',
        }))
      : [];
    const lq = Array.isArray(raw.examNotes.longQuestions)
      ? raw.examNotes.longQuestions.map((q: any) => ({
          question: q.question || q.q || '',
          marks: q.marks || 7,
          outline: Array.isArray(q.outline) ? q.outline : q.a ? [q.a] : [],
        }))
      : [];
    const exMcqs = Array.isArray(raw.examNotes.mcqs)
      ? raw.examNotes.mcqs.map((m: any, idx: number) => {
          const options = Array.isArray(m.options) ? m.options : [];
          let correctIndex = typeof m.correctIndex === 'number' ? m.correctIndex : 0;
          if (m.correctAnswer && options.length > 0) {
            const found = options.findIndex(
              (opt: string) => opt.trim().toLowerCase() === String(m.correctAnswer).trim().toLowerCase()
            );
            if (found !== -1) correctIndex = found;
          }
          return {
            id: m.id || `ex-mcq-${idx + 1}`,
            question: m.question || '',
            options,
            correctIndex,
            correctAnswer: m.correctAnswer || options[correctIndex] || '',
            explanation: m.explanation || 'Key exam concept.',
          };
        })
      : [];
    result.examNotes = { shortQuestions: sq, longQuestions: lq, mcqs: exMcqs };
  }

  if (raw.revisionPlan) {
    const days = Array.isArray(raw.revisionPlan.days)
      ? raw.revisionPlan.days
      : Array.isArray(raw.revisionPlan)
      ? raw.revisionPlan.map((d: any, idx: number) => ({
          dayNumber: d.day || idx + 1,
          dateStr: d.date || `Day ${d.day || idx + 1}`,
          topic: d.topic || 'Revision',
          badge: 'Review',
          duration: '45 mins',
          tasks: Array.isArray(d.tasks) ? d.tasks : [],
        }))
      : [];
    result.revisionPlan = {
      examDate: examDate || raw.revisionPlan.examDate || '2026-06-15',
      totalDays: days.length,
      days,
    };
  }

  if (Array.isArray(raw.activeRecall)) {
    result.activeRecall = raw.activeRecall.map((ar: any, idx: number) => ({
      id: ar.id || `ar-${idx + 1}`,
      question: ar.question || ar.q || '',
      hint: ar.hint || 'Recall the main concept from memory',
      answer: ar.answer || ar.a || '',
      concept: ar.concept || `Topic ${idx + 1}`,
    }));
  }

  return result;
}

async function callGroq(
  apiKey: string,
  messages: { role: string; content: string }[],
  jsonMode = false
) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      temperature: 0.5,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq failed (${res.status}): ${errText}`);
  }
  const data: any = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const geminiKey = env.GEMINI_API_KEY || '';
  const groqKey = env.GROQ_API_KEY || '';

  // GET /api/health
  if (url.pathname === '/api/health' && request.method === 'GET') {
    return jsonResponse({
      gemini: Boolean(geminiKey && geminiKey.trim() && geminiKey !== 'MY_GEMINI_API_KEY'),
      groq: Boolean(groqKey && groqKey.trim()),
      status: 'ok',
    });
  }

  // POST /api/generate
  if (url.pathname === '/api/generate' && request.method === 'POST') {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON payload' }, 400);
    }

    const { notes, examDate, language = 'English', selectedFeatures = [] } = body;
    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      return jsonResponse({ error: 'Notes text is required to generate study materials.' }, 400);
    }

    const isUrdu = language === 'Roman Urdu';
    const systemPrompt = `You are Notes2Quiz, an expert academic tutor for university students in Pakistan.
Turn the user's study notes into high-yield, structured study materials.
Language: ${language}. ${
      isUrdu
        ? 'IMPORTANT: Respond completely in Roman Urdu (Urdu written in English alphabet, e.g., "Yeh topic exam ke liye ahem hai"). Keep technical and medical terms in English.'
        : 'Generate in clear, rigorous academic English.'
    }
Target Exam Date: ${examDate || 'General revision'}.
Generate ONLY the sections corresponding to selectedFeatures: ${JSON.stringify(selectedFeatures)}.
Respond with valid JSON matching this schema:
{
  "simplifiedNotes": { "title": "...", "sections": [{ "heading": "...", "content": "..." }] },
  "keyPoints": { "summary": "...", "points": ["..."] },
  "mcqs": [{ "question": "...", "options": ["...","...","...","..."], "correctAnswer": "...", "explanation": "..." }],
  "flashcards": [{ "question": "...", "answer": "..." }],
  "examNotes": {
    "shortQuestions": [{ "q": "...", "a": "..." }],
    "longQuestions": [{ "q": "...", "a": "..." }],
    "mcqs": [{ "question": "...", "options": ["..."], "correctAnswer": "..." }]
  },
  "revisionPlan": [{ "day": 1, "date": "...", "topic": "...", "tasks": ["..."] }],
  "activeRecall": [{ "question": "...", "answer": "..." }]
}`;

    const userPrompt = `Study Notes:\n"""\n${notes}\n"""\nGenerate the study pack JSON now.`;

    let generatedJsonStr = '';
    let fallbackShifted = false;

    if (geminiKey && geminiKey.trim() && geminiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          config: { responseMimeType: 'application/json' },
        });
        generatedJsonStr = response.text || '';
      } catch (geminiErr) {
        console.warn('Gemini generate failed, attempting Groq fallback:', geminiErr);
      }
    }

    if (!generatedJsonStr && groqKey && groqKey.trim()) {
      try {
        generatedJsonStr = await callGroq(
          groqKey,
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          true
        );
        fallbackShifted = true;
      } catch (groqErr) {
        console.error('Groq generate failed:', groqErr);
      }
    }

    if (!generatedJsonStr) {
      return jsonResponse(
        { error: 'All AI models are currently busy. Please try again in a few moments.' },
        503
      );
    }

    try {
      const cleanJson = generatedJsonStr
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      const parsed = JSON.parse(cleanJson);
      const normalized = normalizeStudyPack(parsed, examDate);
      if (fallbackShifted) normalized._fallbackShifted = true;
      return jsonResponse(normalized);
    } catch {
      return jsonResponse({ error: 'Failed to parse AI study pack response. Please retry.' }, 500);
    }
  }

  // POST /api/chat
  if (url.pathname === '/api/chat' && request.method === 'POST') {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON payload' }, 400);
    }

    const userMessage =
      body.message || (body.messages && body.messages[body.messages.length - 1]?.content) || '';
    const notesContext = body.notesContext || body.notes || '';
    const history = body.history || body.messages?.slice(0, -1) || [];
    const language = body.language || 'English';
    const isUrdu = language === 'Roman Urdu';

    if (!userMessage) {
      return jsonResponse({ error: 'Message content is required' }, 400);
    }

    const systemInstruction = `You are Notes2Quiz, an expert academic tutor for university students in Pakistan.
Use the student's study notes as context:
"""
${notesContext || 'General academic tutoring'}
"""
Language: ${language}. ${
      isUrdu
        ? 'Reply in Roman Urdu (Urdu written in English alphabet) keeping technical terms in English.'
        : 'Reply in clear, supportive academic English.'
    }
Answer the student's question directly, accurately, and concisely.`;

    let replyText = '';
    let fallbackShifted = false;

    if (geminiKey && geminiKey.trim() && geminiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const contents = [
          ...history.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          { role: 'user', parts: [{ text: userMessage }] },
        ];
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: { systemInstruction },
        });
        replyText = response.text || '';
      } catch (geminiErr) {
        console.warn('Gemini chat failed, trying Groq fallback:', geminiErr);
      }
    }

    if (!replyText && groqKey && groqKey.trim()) {
      try {
        const groqMessages = [
          { role: 'system', content: systemInstruction },
          ...history.map((m: any) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ];
        replyText = await callGroq(groqKey, groqMessages, false);
        fallbackShifted = true;
      } catch (groqErr) {
        console.error('Groq chat failed:', groqErr);
      }
    }

    if (!replyText) {
      return jsonResponse(
        { error: 'All AI models are currently busy. Please try again in a few moments.' },
        503
      );
    }

    return jsonResponse({
      reply: replyText,
      text: replyText,
      ...(fallbackShifted ? { _fallbackShifted: true } : {}),
    });
  }

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}

// Cloudflare Worker default export
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }
    if (env?.ASSETS?.fetch) {
      return env.ASSETS.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  },
};
