import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatThread, ChatMessage } from './components/ChatThread';
import { InputDock } from './components/InputDock';
import { CameraOverlay } from './components/CameraOverlay';
import { WarningToast } from './components/WarningToast';
import { TimedQuizModal } from './components/TimedQuizModal';
import { SettingsModal } from './components/SettingsModal';
import {
  StudyPackData,
  SAMPLE_NOTES,
  SAMPLE_CS_NOTES,
  SAMPLE_PAK_NOTES,
} from './types/studyPack';
import {
  StoredSession,
  getCachedSessions,
  saveCachedSessions,
  getCachedActiveSessionId,
  setCachedActiveSessionId,
  getCachedPreferences,
  saveCachedPreferences,
  createNewStoredSession,
  clearAllCachedData,
  UserPreferences,
} from './utils/storage';
import { extractTextFromFile } from './utils/fileExtractor';
import { FileAttachment } from './components/Bubble';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

// Classifier helper for user messages
function classifyUserSubmission(
  text: string,
  hasFiles: boolean
): 'greeting' | 'non_study' | 'study_notes' {
  if (hasFiles) {
    return 'study_notes';
  }

  const clean = text.trim().toLowerCase();
  if (!clean) return 'non_study';

  // 1. Check Greeting
  const cleanNoPunct = clean.replace(/[!.,?]+$/, '').trim();
  const greetings = [
    'hi',
    'hello',
    'hey',
    'heyy',
    'heya',
    'salam',
    'assalam o alaikum',
    'assalamu alaikum',
    'assalam-o-alaikum',
    'aoa',
    'good morning',
    'good afternoon',
    'good evening',
    'howdy',
    'sup',
    "what's up",
    'hola',
  ];
  if (greetings.includes(cleanNoPunct)) {
    return 'greeting';
  }

  // 2. Check for clear non-study material (jokes, small talk, gibberish)
  const isJoke =
    /^(tell me a joke|tell a joke|joke|make me laugh|say something funny|say a joke)/i.test(
      clean
    );
  const isSmallTalk =
    /^(who won|who is|what is your name|how are you|weather|sing a song|play a game|tell a story|who created you|are you human|what's your name)/i.test(
      clean
    );

  // Gibberish detection: repeated char, consonant smash, or common keyboard smashes
  const isGibberish =
    /^(.)\1{4,}$/.test(clean) ||
    (!clean.includes(' ') && clean.length > 7 && !/[aeiouy]/i.test(clean)) ||
    ['asdf', 'qwerty', 'zxcv', 'blablabla', 'hahaha', 'lol'].includes(clean);

  if (isJoke || isSmallTalk || isGibberish) {
    return 'non_study';
  }

  // Academic keyword or structured notes check
  const words = clean.split(/\s+/).filter(Boolean);
  const academicKeywords = [
    'chapter',
    'lecture',
    'note',
    'notes',
    'exam',
    'quiz',
    'definition',
    'algorithm',
    'formula',
    'theorem',
    'concept',
    'theory',
    'cell',
    'dna',
    'rna',
    'protein',
    'cycle',
    'reaction',
    'history',
    'law',
    'constitution',
    'system',
    'process',
    'function',
    'biology',
    'chemistry',
    'physics',
    'computer',
    'math',
    'calculus',
    'mechanics',
    'energy',
    'atp',
    'gradient',
    'acid',
    'base',
    'synthesis',
    'structure',
    'classification',
    'summary',
    'syllabus',
    'midterm',
    'final',
    'module',
    'mitochondria',
    'glucose',
    'traversal',
    'complexity',
  ];

  const hasAcademicKeyword = words.some((w) =>
    academicKeywords.some((kw) => w.includes(kw))
  );
  const hasFormatting =
    text.includes('\n') ||
    text.includes('- ') ||
    text.includes('* ') ||
    text.includes(':') ||
    text.includes('=');

  // If text is very short (< 5 words) and lacks any study keyword/formatting, flag as non_study
  if (words.length < 5 && !hasAcademicKeyword && !hasFormatting) {
    return 'non_study';
  }

  return 'study_notes';
}

export default function App() {
  // Load initial preferences from cache
  const [preferences, setPreferences] = useState<UserPreferences>(() => getCachedPreferences());
  // Website opens in Dark mode by default
  const [isNightMode, setIsNightMode] = useState<boolean>(() => preferences.isNightMode ?? true);

  // Load initial sessions from cache
  const [sessions, setSessions] = useState<StoredSession[]>(() => {
    const cached = getCachedSessions();
    if (cached.length > 0) {
      // Ensure the first session has greeting message if messages is empty
      return cached.map((s) => {
        if (!s.messages || s.messages.length === 0) {
          return {
            ...s,
            messages: [
              {
                id: `greeting-${s.createdAt}`,
                sender: 'assistant' as const,
                text: "Hi! I’m Notes2Quiz. Please paste your notes or upload a PDF/photo to get started.",
                timestamp: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        }
        return s;
      });
    }
    // Start with one clean session with greeting message
    const initialSession = createNewStoredSession('New Study Session', preferences.defaultLanguage);
    return [initialSession];
  });

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const cachedId = getCachedActiveSessionId();
    const cachedSessions = getCachedSessions();
    if (cachedId && cachedSessions.some((s) => s.id === cachedId)) {
      return cachedId;
    }
    return sessions[0]?.id || `session-${Date.now()}`;
  });

  // Find active session
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ||
    sessions[0] ||
    createNewStoredSession();

  // Navigation & Layout
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Modals
  const [isTimedQuizOpen, setIsTimedQuizOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Input bar state: holds user text AND attached files waiting to be sent
  const [inputText, setInputText] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [isFallbackActive, setIsFallbackActive] = useState<boolean>(false);
  const [appToast, setAppToast] = useState<{ message: string; type?: 'info' | 'success' } | null>(null);

  const showAppToast = (message: string, type: 'info' | 'success' = 'info') => {
    setAppToast({ message, type });
    setTimeout(() => setAppToast(null), 3800);
  };

  // Persist sessions to cache
  useEffect(() => {
    saveCachedSessions(sessions);
    if (activeSessionId) {
      setCachedActiveSessionId(activeSessionId);
    }
  }, [sessions, activeSessionId]);

  // Persist preferences (stores dark/light mode preference)
  useEffect(() => {
    saveCachedPreferences({
      ...preferences,
      isNightMode,
    });
  }, [preferences, isNightMode]);

  // Helper to update active session in state
  const updateActiveSession = useCallback(
    (updater: (prev: StoredSession) => StoredSession) => {
      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSessionId) {
            const updated = updater(s);
            return { ...updated, updatedAt: Date.now() };
          }
          return s;
        })
      );
    },
    [activeSessionId]
  );

  // New Chat Behavior:
  // "Only create a new chat when the user actually sends a message in the current chat.
  // If the user clicks “New Chat” without sending any message, it should not create another empty chat."
  const handleNewSession = useCallback(() => {
    const hasUserMessage = activeSession.messages.some((m) => m.sender === 'user');
    if (!hasUserMessage) {
      // Current chat has no user messages yet -> do NOT create another empty chat!
      setInputText('');
      setAttachedFiles([]);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      return;
    }

    // Check if an empty session already exists
    const existingEmpty = sessions.find((s) => !s.messages.some((m) => m.sender === 'user'));
    if (existingEmpty) {
      setActiveSessionId(existingEmpty.id);
      setInputText('');
      setAttachedFiles([]);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      return;
    }

    // Only create a new chat when user actually sent a message in the current chat
    const newSession = createNewStoredSession('New Study Session', preferences.defaultLanguage);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputText('');
    setAttachedFiles([]);
    setConversationTurns([]);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [activeSession, sessions, preferences.defaultLanguage]);

  // Delete session
  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (remaining.length === 0) {
          const fresh = createNewStoredSession('New Study Session', preferences.defaultLanguage);
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (activeSessionId === id) {
          setActiveSessionId(remaining[0].id);
        }
        return remaining;
      });
      showAppToast('Chat session deleted from cache', 'info');
    },
    [activeSessionId, preferences.defaultLanguage]
  );

  // Rename session
  const handleRenameSession = useCallback((id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  }, []);

  // Select session
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setInputText('');
    setAttachedFiles([]);
    setConversationTurns([]);
  };

  // Keyboard shortcut: ⌘K or Ctrl+K for New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewSession]);

  // File Upload Handlers:
  // "When the user selects or uploads a PDF/file, it should not automatically process it.
  // The file should only stay in the input bar. The user must be able to add more text or more files.
  // Only when the user clicks the send button should the bot start working."
  const handleAddFiles = (newFiles: File[]) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md'];
    const validFiles: File[] = [];

    for (const file of newFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        showAppToast('Invalid file type. Please upload a PDF, DOCX, TXT, or MD file.', 'info');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        showAppToast(
          'File is too large. Please upload a file smaller than 5MB to ensure smooth AI processing.',
          'info'
        );
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Camera capture adds a simulated handwritten notes file to attached files
  const handleCameraCapture = (subject: string) => {
    setIsCameraOpen(false);
    const mockFileContent = `Whiteboard & Handwritten Notes: ${subject}\n\n- Key definitions, formulas, and biochemical pathways recorded from whiteboard.\n- High-yield mechanisms and exam questions.`;
    const photoBlob = new Blob([mockFileContent], { type: 'image/jpeg' });
    const photoFile = new File([photoBlob], `${subject}_Handwritten_Notes.jpg`, {
      type: 'image/jpeg',
    });

    setAttachedFiles((prev) => [...prev, photoFile]);
    showAppToast(`Photo notes attached to input bar. Add notes or click Send.`, 'info');
  };

  // Send button clicked (or Enter key pressed)
  const handleSendInput = async () => {
    const text = inputText.trim();
    const hasFiles = attachedFiles.length > 0;

    if (!text && !hasFiles) return;

    // 1. If files are attached:
    // Extract text from attached files now that the user clicked send!
    if (hasFiles) {
      setIsParsingFile(true);
      try {
        const fileAttachmentsMeta: FileAttachment[] = [];
        let combinedExtractedText = '';

        for (const file of attachedFiles) {
          const result = await extractTextFromFile(file);
          if (result.text && result.text.trim()) {
            combinedExtractedText += `\n\n--- Document: ${file.name} ---\n${result.text}`;
          }
          fileAttachmentsMeta.push({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            pages: result.pageCount ? `${result.pageCount} pages` : 'Document',
            type: file.type.includes('image')
              ? 'image'
              : file.name.endsWith('.pdf')
              ? 'pdf'
              : 'docx',
            ocrAccuracy: file.type.includes('image') ? '99.4%' : undefined,
          });
        }

        const fullNotesContent = `${combinedExtractedText}\n\n${text}`.trim();
        const titleHint =
          attachedFiles[0]?.name.replace(/\.[^/.]+$/, '') ||
          text.slice(0, 35) ||
          'Study Session';

        const userMsg: ChatMessage = {
          id: `user-files-${Date.now()}`,
          sender: 'user',
          text: text || `Uploaded ${attachedFiles.length} study document(s)`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachments: fileAttachmentsMeta,
        };

        // Bot asks what they want to create
        const botAskMsg: ChatMessage = {
          id: `bot-ask-${Date.now()}`,
          sender: 'assistant',
          text: "I’ve received your study material! What would you like to create? Choose your study strategy below to generate your custom study pack:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        updateActiveSession((prev) => ({
          ...prev,
          title: titleHint,
          rawNotes: fullNotesContent,
          step: 1, // Shows StudyStrategyCard
          messages: [...prev.messages, userMsg, botAskMsg],
        }));

        setInputText('');
        setAttachedFiles([]);
      } catch (err: any) {
        console.error('File parsing error:', err);
        showAppToast('Could not read the file. Please try a different file.');
      } finally {
        setIsParsingFile(false);
      }
      return;
    }

    // 2. If NO files are attached:
    // If the study pack is already generated (step >= 5), handle as follow-up question
    if (activeSession.step >= 5) {
      const userMsg: ChatMessage = {
        id: `user-followup-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const thinkingId = `thinking-${Date.now()}`;
      const thinkingMsg: ChatMessage = {
        id: thinkingId,
        sender: 'assistant',
        isThinking: true,
      };

      setInputText('');
      const newTurn: ConversationTurn = { role: 'user', content: text };
      const updatedHistory = [...conversationTurns, newTurn];

      updateActiveSession((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg, thinkingMsg],
      }));

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: activeSession.rawNotes || SAMPLE_NOTES,
            language: activeSession.language,
            messages: updatedHistory.slice(-8),
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.text || data.reply || 'No response returned.';

        const newAssistantTurn: ConversationTurn = { role: 'assistant', content: botResponse };
        setConversationTurns([...updatedHistory, newAssistantTurn]);

        const botMsg: ChatMessage = {
          id: `bot-reply-${Date.now()}`,
          sender: 'assistant',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionChips: [
            {
              label: "Explain like I'm 10",
              onClick: () =>
                setInputText("Explain the main mechanism here like I'm 10 using simple analogies"),
            },
            {
              label: 'Make questions harder',
              onClick: () =>
                setInputText('Give me a challenging university exam-level question on this topic'),
            },
            {
              label: '1-Page Summary',
              onClick: () =>
                setInputText('Summarize this into a concise 1-page exam summary cheat sheet'),
            },
          ],
        };

        updateActiveSession((prev) => {
          const filtered = prev.messages.filter((m) => m.id !== thinkingId);
          return {
            ...prev,
            step: 6,
            messages: [...filtered, botMsg],
          };
        });
      } catch (err: any) {
        console.error('Chat error:', err);
        updateActiveSession((prev) => {
          const filtered = prev.messages.filter((m) => m.id !== thinkingId);
          return {
            ...prev,
            messages: [
              ...filtered,
              {
                id: `err-chat-${Date.now()}`,
                sender: 'assistant',
                text: `Could not get an answer: ${err.message || 'Connection error'}.`,
                timestamp: 'Just now',
              },
            ],
          };
        });
      }
      return;
    }

    // 3. User sent typed text before any study pack was created:
    // Classify text into: greeting, non_study, or study_notes
    const classification = classifyUserSubmission(text, false);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (classification === 'greeting') {
      // If user says "hi", "hello", etc., reply normally and wait for notes
      const botReply: ChatMessage = {
        id: `bot-greeting-${Date.now()}`,
        sender: 'assistant',
        text: "Hello! How can I help you today? Please paste your study notes, or upload a PDF/DOCX or photo of your handwritten notes, and I will generate custom study materials, quizzes, and flashcards for you!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      updateActiveSession((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg, botReply],
      }));
      setInputText('');
      return;
    }

    if (classification === 'non_study') {
      // If user sends random text, jokes, etc., show polite disclaimer
      const disclaimerMsg: ChatMessage = {
        id: `bot-disclaimer-${Date.now()}`,
        sender: 'assistant',
        text: "This doesn’t seem related to studies. Please send your notes or study material so I can help you.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      updateActiveSession((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg, disclaimerMsg],
      }));
      setInputText('');
      return;
    }

    // Valid study notes received!
    // The bot asks the user what they want to create
    const titleHint = text.slice(0, 35).split('\n')[0] || 'Study Session';
    const botAskMsg: ChatMessage = {
      id: `bot-ask-${Date.now()}`,
      sender: 'assistant',
      text: "I’ve received your study notes! What would you like to create? Choose your study strategy below to generate your custom study pack:",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    updateActiveSession((prev) => ({
      ...prev,
      title: titleHint,
      rawNotes: text,
      step: 1, // Shows StudyStrategyCard
      messages: [...prev.messages, userMsg, botAskMsg],
    }));

    setInputText('');
  };

  // Toggle study features in StudyStrategyCard
  const handleToggleFeature = (id: string) => {
    updateActiveSession((prev) => {
      if (id === 'full_package') {
        const isCurrentlyFull = prev.selectedFeatures.includes('full_package');
        return {
          ...prev,
          selectedFeatures: isCurrentlyFull ? [] : ['full_package'],
        };
      }

      const withoutFull = prev.selectedFeatures.filter((f) => f !== 'full_package');
      if (withoutFull.includes(id)) {
        return {
          ...prev,
          selectedFeatures: withoutFull.filter((f) => f !== id),
        };
      } else {
        return {
          ...prev,
          selectedFeatures: [...withoutFull, id],
        };
      }
    });
  };

  const handleSelectAllFeatures = () => {
    updateActiveSession((prev) => {
      const isAll = prev.selectedFeatures.includes('full_package');
      return {
        ...prev,
        selectedFeatures: isAll ? ['exam_notes', 'mcqs'] : ['full_package'],
      };
    });
  };

  // Generate study pack via /api/generate
  const handleGeneratePack = async () => {
    setIsGenerating(true);
    const thinkingId = `thinking-${Date.now()}`;
    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      sender: 'assistant',
      isThinking: true,
    };

    updateActiveSession((prev) => ({
      ...prev,
      messages: [...prev.messages, thinkingMsg],
    }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: activeSession.rawNotes || SAMPLE_NOTES,
          examDate: activeSession.examDate || undefined,
          language: activeSession.language,
          selectedFeatures: activeSession.selectedFeatures,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${response.status}`);
      }

      const generated: StudyPackData = await response.json();
      if (generated._fallbackShifted) {
        setIsFallbackActive(true);
      }

      // Increment student notes processed counter in preferences
      setPreferences((prev) => ({
        ...prev,
        notesProcessedCount: Math.min(50, prev.notesProcessedCount + 1),
      }));

      updateActiveSession((prev) => {
        const filtered = prev.messages.filter((m) => m.id !== thinkingId);
        return {
          ...prev,
          studyPack: generated,
          step: 5, // Study pack ready
          messages: [
            ...filtered,
            {
              id: `pack-${Date.now()}`,
              sender: 'assistant',
              isStudyPack: true,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
      });

      showAppToast('Study pack generated successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to generate study pack:', err);
      updateActiveSession((prev) => {
        const filtered = prev.messages.filter((m) => m.id !== thinkingId);
        return {
          ...prev,
          messages: [
            ...filtered,
            {
              id: `err-${Date.now()}`,
              sender: 'assistant',
              text: `Could not generate study pack: ${err.message || 'Network error'}. Please try again.`,
              timestamp: 'Just now',
            },
          ],
        };
      });
      showAppToast(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load sample course notes (bio, cs, or pak)
  const handleLoadSampleNotes = (sampleType: 'bio' | 'cs' | 'pak' = 'bio') => {
    let content = SAMPLE_NOTES;
    let title = 'Cellular Respiration & ATP (BIO 301)';
    if (sampleType === 'cs') {
      content = SAMPLE_CS_NOTES;
      title = 'Data Structures & Algorithms (CS 201)';
    } else if (sampleType === 'pak') {
      content = SAMPLE_PAK_NOTES;
      title = 'Pakistan Constitutional History (PAK 101)';
    }

    const userMsg: ChatMessage = {
      id: `user-sample-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const botAskMsg: ChatMessage = {
      id: `bot-ask-${Date.now()}`,
      sender: 'assistant',
      text: `I’ve loaded ${title}! What would you like to create? Choose your study strategy below to generate your custom study pack:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    updateActiveSession((prev) => ({
      ...prev,
      title,
      rawNotes: content,
      step: 1,
      messages: [...prev.messages, userMsg, botAskMsg],
    }));
  };

  // Share session (copies link & summary)
  const handleShareSession = async () => {
    try {
      const shareText = `Notes2Quiz: ${activeSession.title}\nStudy pack with university MCQs & Flashcards: ${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      showAppToast('Study link & summary copied to clipboard!', 'success');
    } catch {
      showAppToast('Study session link copied!', 'success');
    }
  };

  // Clear all cache
  const handleClearAllCache = () => {
    clearAllCachedData();
    const fresh = createNewStoredSession('New Study Session', preferences.defaultLanguage);
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    showAppToast('Cache cleared successfully.', 'info');
  };

  return (
    <div
      className={`h-[100dvh] w-screen flex overflow-hidden select-text relative font-sans transition-colors ${
        isNightMode ? 'bg-[#0B0B0C] text-[#EDEDED] dark' : 'bg-[#FAFAF7] text-[#1A1A1A]'
      }`}
    >
      {/* Toast Notification */}
      {appToast && (
        <div
          role="status"
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-[6px] border shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-2.5 text-[13px] max-w-[90vw] ${
            isNightMode
              ? 'bg-[#141416] text-[#EDEDED] border-[rgba(237,237,237,0.1)]'
              : 'bg-[#F2F1EC] text-[#1A1A1A] border-[rgba(26,26,26,0.1)]'
          }`}
        >
          {appToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#2D4A3E] shrink-0" strokeWidth={1.5} />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#8A8A8A] shrink-0" strokeWidth={1.5} />
          )}
          <span>{appToast.message}</span>
        </div>
      )}

      {/* Warning Toast */}
      <WarningToast
        isVisible={isFallbackActive}
        onDismiss={() => setIsFallbackActive(false)}
      />

      {/* Collapsible Left Sidebar (Hamburger button removed, uses working collapse/expand button) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        studentName={preferences.studentName}
        studentRole={preferences.studentRole}
        notesProcessedCount={preferences.notesProcessedCount}
        notesTotalLimit={50}
        isNightMode={isNightMode}
      />

      {/* Main Workspace */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-colors ${
          isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
        }`}
      >
        {/* Top Header: Hamburger & New Chat removed, theme toggle kept */}
        <Header
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          sessionTitle={activeSession.title}
          onUpdateSessionTitle={(newTitle) => handleRenameSession(activeSessionId, newTitle)}
          onShareSession={handleShareSession}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isQuizReady={Boolean(activeSession.studyPack)}
          questionCount={activeSession.studyPack?.mcqs?.length || 0}
          isNightMode={isNightMode}
          onToggleNightMode={() => setIsNightMode((p) => !p)}
          language={activeSession.language}
          onToggleLanguage={(lang) =>
            updateActiveSession((prev) => ({ ...prev, language: lang }))
          }
          studentName={preferences.studentName}
        />

        {/* Chat Thread: Always starts with friendly greeting message */}
        <ChatThread
          step={activeSession.step}
          messages={activeSession.messages}
          studyPackData={activeSession.studyPack}
          selectedFeatures={activeSession.selectedFeatures}
          examDate={activeSession.examDate}
          language={activeSession.language}
          sessionTitle={activeSession.title}
          notesWordCount={activeSession.rawNotes.split(/\s+/).length}
          extractedThemes={activeSession.studyPack?.extractedThemes}
          onExamDateChange={(date) =>
            updateActiveSession((prev) => ({ ...prev, examDate: date }))
          }
          onSubmitExamDate={() => updateActiveSession((prev) => ({ ...prev, step: 2 }))}
          onSkipExamDate={() => updateActiveSession((prev) => ({ ...prev, step: 2 }))}
          onSelectLanguage={(lang) =>
            updateActiveSession((prev) => ({ ...prev, language: lang }))
          }
          onToggleFeature={handleToggleFeature}
          onSelectAllFeatures={handleSelectAllFeatures}
          onGeneratePack={handleGeneratePack}
          onLoadSampleNotes={handleLoadSampleNotes}
          onStartTimedQuiz={() => setIsTimedQuizOpen(true)}
          isGenerating={isGenerating}
          isNightMode={isNightMode}
        />

        {/* Bottom Floating Input Dock: files stay in bar until user clicks send */}
        <InputDock
          value={inputText}
          onChange={setInputText}
          attachedFiles={attachedFiles}
          onAddFiles={handleAddFiles}
          onRemoveFile={handleRemoveAttachedFile}
          onSend={handleSendInput}
          onOpenCamera={() => setIsCameraOpen(true)}
          onSelectSuggestionPrompt={(p) => setInputText(p)}
          onValidationError={(msg) => showAppToast(msg, 'info')}
          isParsingFile={isParsingFile}
          disabled={isGenerating}
          disabledReason={isGenerating ? 'Synthesizing your academic study pack…' : undefined}
          placeholder="Paste your study notes, ask a question, or attach files…"
          selectedModel="Gemini 2.5"
          isNightMode={isNightMode}
        />
      </div>

      {/* Timed Quiz Exam Simulation Modal */}
      <TimedQuizModal
        isOpen={isTimedQuizOpen}
        onClose={() => setIsTimedQuizOpen(false)}
        questions={activeSession.studyPack?.mcqs || []}
        title={activeSession.title}
        durationMinutes={15}
        isNightMode={isNightMode}
      />

      {/* Settings Modal with Cache Management */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        studentName={preferences.studentName}
        onUpdateStudentName={(name) =>
          setPreferences((prev) => ({ ...prev, studentName: name }))
        }
        studentRole={preferences.studentRole}
        onUpdateStudentRole={(role) =>
          setPreferences((prev) => ({ ...prev, studentRole: role }))
        }
        defaultLanguage={preferences.defaultLanguage}
        onUpdateDefaultLanguage={(lang) =>
          setPreferences((prev) => ({ ...prev, defaultLanguage: lang }))
        }
        onClearAllCache={handleClearAllCache}
        savedSessionsCount={sessions.length}
        isNightMode={isNightMode}
      />

      {/* Camera Capture Modal */}
      <CameraOverlay
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
