export interface Env {
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
}

// ⚠️ YOUR VALUES
const CF_ACCOUNT_ID = '931205dbdf3d4664f1df1d1c993ab209';
const CF_GATEWAY_ID = 'notes2quiz-gateway';

// 🔑 Timeout (milliseconds) — AI Gateway default ~100s hai, isliye barhaya
const AI_GATEWAY_TIMEOUT_MS = '120000'; // 120 seconds

// ✅ Current stable Gemini models (Nov 2026)
const GEMINI_MODELS = [
  'gemini-3.8-flash',       // Primary
  'gemini-3.6-flash',       // Fallback 1
  'gemini-3.5-flash-lite',  // Fallback 2 (fastest)
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
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
              (opt: string) =>
                opt.trim().toLowerCase() === String(m.correctAnswer).trim().toLowerCase()
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

// ---------- DIRECT FETCH: Gemini via AI Gateway ----------
async function callGeminiDirect(
  apiKey: string,
  model: string,
  contents: any[],
  systemInstruction?: string,
  responseMimeType?: string
): Promise<{ text: string; model: string }> {
  const urls = [
    `https://gateway.ai.cloudflare.com/v1/${CF_ACCOUNT_ID}/${CF_GATEWAY_ID}/google-ai-studio/v1beta/models/${model}:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
  ];

  const body: any = { contents };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (responseMimeType) {
    body.generationConfig = { responseMimeType };
  }

  let lastError = '';
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 🔑 AI Gateway timeout (default ~100s hai)
          'cf-aig-request-timeout': AI_GATEWAY_TIMEOUT_MS,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `HTTP ${res.status}: ${errText.slice(0, 300)}`;
        console.warn(
          `[GEMINI ${model}] ${url.includes('gateway') ? 'GATEWAY' : 'DIRECT'} → ${lastError}`
        );
        continue;
      }

      const data: any = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) {
        console.log(
          `[GEMINI ${model}] ✓ success via ${url.includes('gateway') ? 'GATEWAY' : 'DIRECT'}`
        );
        return { text, model };
      }
      lastError = 'Empty response from model';
    } catch (e: any) {
      lastError = e?.message || String(e);
      console.warn(`[GEMINI ${model}] fetch error:`, lastError);
    }
  }
  throw new Error(`Gemini ${model} failed: ${lastError}`);
}

// ---------- GROQ via AI Gateway ----------
async function callGroq(
  apiKey: string,
  messages: { role: string; content: string }[],
  jsonMode = false
): Promise<string> {
  const groqUrl = `https://gateway.ai.cloudflare.com/v1/${CF_ACCOUNT_ID}/${CF_GATEWAY_ID}/groq/openai/v1/chat/completions`;

  const res = await fetch(groqUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      // 🔑 AI Gateway timeout
      'cf-aig-request-timeout': AI_GATEWAY_TIMEOUT_MS,
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
    throw new Error(`Groq failed (${res.status}): ${errText.slice(0, 300)}`);
  }
  const data: any = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const geminiKey = (env.GEMINI_API_KEY || '').trim();
  const groqKey = (env.GROQ_API_KEY || '').trim();

  // -------- /api/health --------
  if (url.pathname === '/api/health' && request.method === 'GET') {
    return jsonResponse({
      gemini: Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY'),
      groq: Boolean(groqKey),
      gatewayConfigured: Boolean(
        CF_ACCOUNT_ID &&
          CF_GATEWAY_ID &&
          CF_ACCOUNT_ID !== 'YOUR_ACCOUNT_ID' &&
          CF_GATEWAY_ID !== 'YOUR_GATEWAY_ID'
      ),
      timeoutMs: Number(AI_GATEWAY_TIMEOUT_MS),
      models: GEMINI_MODELS,
      status: 'ok',
    });
  }

  // -------- /api/test-gemini (DIAGNOSTIC ENDPOINT) --------
  if (url.pathname === '/api/test-gemini' && request.method === 'GET') {
    const results: any[] = [];
    for (const model of GEMINI_MODELS) {
      const start = Date.now();
      try {
        const r = await callGeminiDirect(
          geminiKey,
          model,
          [{ role: 'user', parts: [{ text: 'Say hello in one word.' }] }]
        );
        results.push({
          model,
          ok: true,
          ms: Date.now() - start,
          sample: r.text.slice(0, 100),
        });
      } catch (e: any) {
        results.push({
          model,
          ok: false,
          ms: Date.now() - start,
          error: e.message,
        });
      }
    }
    return jsonResponse({ geminiKeyPresent: Boolean(geminiKey), results });
  }

  // -------- /api/generate --------
  if (url.pathname === '/api/generate' && request.method === 'POST') {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON payload' }, 400);
    }

    const { notes, examDate, language = 'English', selectedFeatures = [] } = body;
    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      return jsonResponse({ error: 'Notes text is required.' }, 400);
    }

    // ✂️ Chhoti truncation — 524 timeout se bachne ke liye
    const MAX_NOTES_LENGTH = 4000;
    const truncatedNotes =
      notes.length > MAX_NOTES_LENGTH
        ? notes.slice(0, MAX_NOTES_LENGTH) + '\n\n[... notes truncated ...]'
        : notes;

    const isUrdu = language === 'Roman Urdu';
    const systemPrompt = `You are Notes2Quiz, an expert academic tutor for university students in Pakistan.
Turn the user's study notes into high-yield, structured study materials.
Language: ${language}. ${
      isUrdu
        ? 'IMPORTANT: Respond completely in Roman Urdu (Urdu in English alphabet). Keep technical terms in English.'
        : 'Generate in clear, rigorous academic English.'
    }
Target Exam Date: ${examDate || 'General revision'}.
Generate ONLY these sections: ${JSON.stringify(selectedFeatures)}.
Respond with valid JSON matching this schema:
{
  "simplifiedNotes": { "title": "...", "sections": [{ "heading": "...", "content": "..." }] },
  "keyPoints": { "summary": "...", "points": ["..."] },
  "mcqs": [{ "question": "...", "options": ["..."], "correctAnswer": "...", "explanation": "..." }],
  "flashcards": [{ "question": "...", "answer": "..." }],
  "examNotes": { "shortQuestions": [{"q":"...","a":"..."}], "longQuestions": [{"q":"...","a":"..."}], "mcqs": [{"question":"...","options":["..."],"correctAnswer":"..."}] },
  "revisionPlan": [{ "day": 1, "date": "...", "topic": "...", "tasks": ["..."] }],
  "activeRecall": [{ "question": "...", "answer": "..." }]
}`;

    const userPrompt = `Study Notes:\n"""\n${truncatedNotes}\n"""\nGenerate the study pack JSON now.`;

    let generatedJsonStr = '';
    let fallbackShifted = false;
    const diagnostics: any = { geminiAttempts: [], groqError: '' };

    // 1. Gemini — multiple current models
    if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
      for (const model of GEMINI_MODELS) {
        if (generatedJsonStr) break;
        try {
          const r = await callGeminiDirect(
            geminiKey,
            model,
            [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            undefined,
            'application/json'
          );
          generatedJsonStr = r.text;
        } catch (e: any) {
          diagnostics.geminiAttempts.push({ model, error: e.message });
        }
      }
    }

    // 2. Groq fallback
    if (!generatedJsonStr && groqKey) {
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
      } catch (e: any) {
        diagnostics.groqError = e.message;
        console.error('[GROQ_ERROR]', e.message);
      }
    }

    if (!generatedJsonStr) {
      return jsonResponse(
        {
          error: 'All AI models are currently busy. Please try again in a few moments.',
          _diagnostic: diagnostics,
        },
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
      return jsonResponse(
        { error: 'Failed to parse AI study pack response. Please retry.' },
        500
      );
    }
  }

  // -------- /api/chat --------
  if (url.pathname === '/api/chat' && request.method === 'POST') {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON payload' }, 400);
    }

    const userMessage =
      body.message || (body.messages && body.messages[body.messages.length - 1]?.content) || '';
    const notesContext = (body.notesContext || body.notes || '').slice(0, 6000);
    const history = body.history || body.messages?.slice(0, -1) || [];
    const language = body.language || 'English';
    const isUrdu = language === 'Roman Urdu';

    if (!userMessage) {
      return jsonResponse({ error: 'Message content is required' }, 400);
    }

    const systemInstruction = `You are Notes2Quiz, an expert academic tutor.
Notes context: """
${notesContext || 'General academic tutoring'}
"""
Language: ${language}. ${
      isUrdu
        ? 'Reply in Roman Urdu keeping technical terms in English.'
        : 'Reply in clear academic English.'
    }
Answer directly and concisely.`;

    let replyText = '';
    let fallbackShifted = false;
    const diagnostics: any = { geminiAttempts: [], groqError: '' };

    // 1. Gemini
    if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
      const contents = [
        ...history.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: userMessage }] },
      ];
      for (const model of GEMINI_MODELS) {
        if (replyText) break;
        try {
          const r = await callGeminiDirect(geminiKey, model, contents, systemInstruction);
          replyText = r.text;
        } catch (e: any) {
          diagnostics.geminiAttempts.push({ model, error: e.message });
        }
      }
    }

    // 2. Groq
    if (!replyText && groqKey) {
      try {
        const groqMessages = [
          { role: 'system', content: systemInstruction },
          ...history.map((m: any) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ];
        replyText = await callGroq(groqKey, groqMessages, false);
        fallbackShifted = true;
      } catch (e: any) {
        diagnostics.groqError = e.message;
        console.error('[GROQ_CHAT_ERROR]', e.message);
      }
    }

    if (!replyText) {
      return jsonResponse(
        {
          error: 'All AI models are currently busy. Please try again.',
          _diagnostic: diagnostics,
        },
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

// -------- Cloudflare Worker Export --------
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
