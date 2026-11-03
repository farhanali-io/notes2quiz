import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatThread, ChatMessage } from './components/ChatThread';
import { InputDock } from './components/InputDock';
import { DownloadBar } from './components/DownloadBar';
import { CameraOverlay } from './components/CameraOverlay';
import { WarningToast } from './components/WarningToast';
import {
  SAMPLE_NOTES,
  StudyPackData,
} from './data/mockPacks';
import { extractTextFromFile } from './utils/fileExtractor';
import { AlertCircle } from 'lucide-react';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  // Conversation state machine
  // 0: Greeting (waiting for notes)
  // 1: Notes received (asking for optional exam date)
  // 2: Language selection (English or Roman Urdu)
  // 3: Feature selection (multi-select 8 features)
  // 4: Generating (thinking animation)
  // 5: Results rendered (study pack cards displayed)
  // 6: Follow-up Q&A
  const [step, setStep] = useState<number>(0);

  // User input states
  const [inputText, setInputText] = useState<string>('');
  const [rawNotes, setRawNotes] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('2026-06-15');
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Roman Urdu'>('English');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'exam_notes',
    'key_points',
    'mcqs',
  ]);

  // Active study pack generated via real API
  const [studyPack, setStudyPack] = useState<StudyPackData | null>(null);

  // Dedicated conversation history for follow-up Q&A
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);

  // UI overlays & feedback
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isFallbackActive, setIsFallbackActive] = useState<boolean>(false);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [appToast, setAppToast] = useState<string | null>(null);

  const showAppToast = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => {
      setAppToast(null);
    }, 4500);
  };

  // Initial greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-greeting',
      sender: 'assistant',
      text: "Hi! I'm Notes2Quiz. Send me your study notes as text, or tap the camera icon to upload a photo of handwritten notes.",
      timestamp: 'Just now',
    },
  ]);

  // Reset to initial state (New Chat)
  const handleResetChat = useCallback(() => {
    setStep(0);
    setInputText('');
    setRawNotes('');
    setStudyPack(null);
    setSelectedFeatures(['exam_notes', 'key_points', 'mcqs']);
    setIsFallbackActive(false);
    setIsParsingFile(false);
    setAppToast(null);
    setConversationTurns([]);
    setMessages([
      {
        id: `msg-greeting-${Date.now()}`,
        sender: 'assistant',
        text: "Hi! I'm Notes2Quiz. Send me your study notes as text, or tap the camera icon to upload a photo of handwritten notes.",
        timestamp: 'Just now',
      },
    ]);
  }, []);

  // Quick-load sample notes
  const handleLoadSampleNotes = () => {
    setInputText(SAMPLE_NOTES);
  };

  // User submits notes (typed text or camera OCR)
  const processNotesSubmission = (notesContent: string) => {
    setRawNotes(notesContent);
    const newMsgId = `user-notes-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: newMsgId,
      sender: 'user',
      text: notesContent,
      timestamp: 'Just now',
    };

    const botReply: ChatMessage = {
      id: `bot-exam-${Date.now()}`,
      sender: 'assistant',
      text: "Got it. Do you have an exam date? (Optional — e.g. 2026-06-15). Tap 'Skip' if you don't.",
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setInputText('');
    setStep(1);
  };

  // User uploads document file (.pdf, .docx, .txt, .md)
  const handleFileUpload = async (file: File) => {
    try {
      setIsParsingFile(true);
      const result = await extractTextFromFile(file);

      // Check if image file was selected
      if (result.fileType === 'image') {
        showAppToast('For images, please use the camera button.');
        setIsParsingFile(false);
        return;
      }

      if (!result.text || result.text.trim().length === 0) {
        showAppToast('Could not read the file. Please try a different file.');
        setIsParsingFile(false);
        return;
      }

      // Store extracted notes
      setRawNotes(result.text);

      const snippet = result.text.length > 280 ? `${result.text.slice(0, 280)}…` : result.text;
      const fileBadge = `📄 Uploaded file: ${result.fileName}${result.pageCount ? ` (${result.pageCount} pages)` : ''}\n\n${snippet}`;

      const userMsg: ChatMessage = {
        id: `user-file-${Date.now()}`,
        sender: 'user',
        text: fileBadge,
        timestamp: 'Just now',
      };

      const botReply: ChatMessage = {
        id: `bot-exam-${Date.now()}`,
        sender: 'assistant',
        text: "Got it. Do you have an exam date? (Optional — e.g. 2026-06-15). Tap 'Skip' if you don't.",
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, userMsg, botReply]);
      setInputText('');
      setStep(1);
    } catch (err: any) {
      console.error('File extraction error:', err);
      showAppToast('Could not read the file. Please try a different file.');
    } finally {
      setIsParsingFile(false);
    }
  };

  // Step 1: Exam date submitted
  const handleConfirmExamDate = () => {
    const userMsg: ChatMessage = {
      id: `user-date-${Date.now()}`,
      sender: 'user',
      text: `Target exam date: ${examDate}`,
      timestamp: 'Just now',
    };

    const botReply: ChatMessage = {
      id: `bot-lang-${Date.now()}`,
      sender: 'assistant',
      text: 'Which language should I use?',
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setStep(2);
  };

  // Step 1: Exam date skipped
  const handleSkipExamDate = () => {
    const userMsg: ChatMessage = {
      id: `user-skip-${Date.now()}`,
      sender: 'user',
      text: 'No specific exam date (general study)',
      timestamp: 'Just now',
    };

    const botReply: ChatMessage = {
      id: `bot-lang-${Date.now()}`,
      sender: 'assistant',
      text: 'Which language should I use?',
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setStep(2);
  };

  // Step 2: Language selection
  const handleSelectLanguage = (lang: 'English' | 'Roman Urdu') => {
    setSelectedLanguage(lang);

    const userMsg: ChatMessage = {
      id: `user-lang-${Date.now()}`,
      sender: 'user',
      text: lang,
      timestamp: 'Just now',
    };

    const botReply: ChatMessage = {
      id: `bot-features-${Date.now()}`,
      sender: 'assistant',
      text: 'What should I generate? Tap one or more options, then press Generate.',
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setStep(3);
  };

  // Step 3: Feature selection toggles
  const handleToggleFeature = (id: string) => {
    if (id === 'full_package') {
      if (selectedFeatures.includes('full_package')) {
        setSelectedFeatures([]);
      } else {
        setSelectedFeatures(['full_package']);
      }
      return;
    }

    setSelectedFeatures((prev) => {
      const withoutFull = prev.filter((f) => f !== 'full_package');
      if (withoutFull.includes(id)) {
        return withoutFull.filter((f) => f !== id);
      } else {
        return [...withoutFull, id];
      }
    });
  };

  const handleSelectAllFeatures = () => {
    if (selectedFeatures.includes('full_package')) {
      setSelectedFeatures([]);
    } else {
      setSelectedFeatures(['full_package']);
    }
  };

  // Step 4 -> 5: Real fetch call to /api/generate
  const handleGeneratePack = async () => {
    setStep(4);

    const thinkingMsgId = `thinking-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: `user-gen-${Date.now()}`,
      sender: 'user',
      text: `Generate selected materials (${
        selectedFeatures.length === 1 && selectedFeatures[0] === 'full_package'
          ? 'Full Package'
          : selectedFeatures.join(', ')
      })`,
      timestamp: 'Just now',
    };

    const thinkingMsg: ChatMessage = {
      id: thinkingMsgId,
      sender: 'assistant',
      isThinking: true,
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: rawNotes,
          examDate: examDate || undefined,
          language: selectedLanguage,
          selectedFeatures: selectedFeatures,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const generatedPack: any = await response.json();
      if (generatedPack._fallbackShifted) {
        setIsFallbackActive(true);
      }
      setStudyPack(generatedPack);

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== thinkingMsgId);
        return [
          ...filtered,
          {
            id: `pack-${Date.now()}`,
            sender: 'assistant',
            isStudyPack: true,
            timestamp: 'Just now',
          },
        ];
      });

      // Clear earlier turns so follow-up conversation begins fresh with notes context
      setConversationTurns([]);
      setStep(5);
    } catch (err: any) {
      console.error('Failed to generate study pack:', err);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== thinkingMsgId);
        return [
          ...filtered,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: `⚠️ Could not generate study pack: ${err.message || 'Network error'}. Please try again.`,
            timestamp: 'Just now',
          },
        ];
      });
      showAppToast(err.message || 'Failed to generate study pack. Please try again.');
      setStep(3); // return to feature selection
    }
  };

  // Step 6: Follow-up question & answer with real fetch to /api/chat
  const handleSendInput = async () => {
    const text = inputText.trim();
    if (!text) return;

    if (step === 0) {
      processNotesSubmission(text);
      return;
    }

    // Follow-up Q&A turn
    const userMsg: ChatMessage = {
      id: `user-followup-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    const thinkingFollowupId = `thinking-followup-${Date.now()}`;
    const thinkingMsg: ChatMessage = {
      id: thinkingFollowupId,
      sender: 'assistant',
      isThinking: true,
    };

    setInputText('');

    // Append user turn to full conversation history
    const newUserTurn: ConversationTurn = { role: 'user', content: text };
    const updatedHistory = [...conversationTurns, newUserTurn];
    const trimmedHistory = updatedHistory.slice(-8);

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: rawNotes,
          language: selectedLanguage,
          messages: trimmedHistory,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.text || 'No response returned from tutor.';

      const newAssistantTurn: ConversationTurn = { role: 'assistant', content: botResponse };
      setConversationTurns([...updatedHistory, newAssistantTurn]);

      const botMsg: ChatMessage = {
        id: `bot-followup-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: 'Just now',
        actionChips: [
          {
            label: 'Simplify',
            onClick: () => handleContextAction('Simplify', text),
          },
          {
            label: 'Make harder',
            onClick: () => handleContextAction('Make harder', text),
          },
          {
            label: 'Regenerate',
            onClick: () => handleContextAction('Regenerate', text),
          },
        ],
      };

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== thinkingFollowupId);
        return [...filtered, botMsg];
      });
      setStep(6);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== thinkingFollowupId);
        return [
          ...filtered,
          {
            id: `err-chat-${Date.now()}`,
            sender: 'assistant',
            text: `⚠️ Could not get an answer: ${err.message || 'Connection error'}. Please try asking again.`,
            timestamp: 'Just now',
          },
        ];
      });
    }
  };

  // Contextual action chips handler ("Simplify", "Make harder", "Regenerate")
  const handleContextAction = async (action: 'Simplify' | 'Make harder' | 'Regenerate', lastTopic = '') => {
    let promptInstruction = '';
    if (action === 'Simplify') {
      promptInstruction = `Please simplify your previous explanation about "${lastTopic || 'this concept'}" using everyday intuitive analogies and very clear language.`;
    } else if (action === 'Make harder') {
      promptInstruction = `Provide a challenging university-level exam question and clinical/biochemical depth regarding "${lastTopic || 'this concept'}".`;
    } else {
      promptInstruction = `Regenerate with a fresh high-yield practice question and detailed explanation regarding "${lastTopic || 'this concept'}".`;
    }

    const chipThinkingId = `chip-thinking-${Date.now()}`;
    const thinkingMsg: ChatMessage = {
      id: chipThinkingId,
      sender: 'assistant',
      isThinking: true,
    };

    setMessages((prev) => [...prev, thinkingMsg]);

    const chipUserTurn: ConversationTurn = { role: 'user', content: promptInstruction };
    const updatedHistory = [...conversationTurns, chipUserTurn];
    const trimmedHistory = updatedHistory.slice(-8);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: rawNotes,
          language: selectedLanguage,
          messages: trimmedHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get updated answer');
      }

      const data = await response.json();
      const responseText = data.text;

      const chipAssistantTurn: ConversationTurn = { role: 'assistant', content: responseText };
      setConversationTurns([...updatedHistory, chipAssistantTurn]);

      const chipReply: ChatMessage = {
        id: `bot-chip-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: 'Just now',
        actionChips: [
          {
            label: 'Simplify',
            onClick: () => handleContextAction('Simplify', lastTopic),
          },
          {
            label: 'Make harder',
            onClick: () => handleContextAction('Make harder', lastTopic),
          },
          {
            label: 'Regenerate',
            onClick: () => handleContextAction('Regenerate', lastTopic),
          },
        ],
      };

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== chipThinkingId);
        return [...filtered, chipReply];
      });
    } catch (err: any) {
      console.error('Action chip error:', err);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== chipThinkingId);
        return [
          ...filtered,
          {
            id: `err-chip-${Date.now()}`,
            sender: 'assistant',
            text: `⚠️ Could not process "${action}": ${err.message || 'Connection error'}.`,
            timestamp: 'Just now',
          },
        ];
      });
    }
  };

  // Camera capture simulation
  const handleCameraCapture = (subject: string) => {
    setIsCameraOpen(false);
    const mockImageText = `📷 Handwritten notes uploaded: [${subject}] Cell Cycle, Mitosis Phases & Checkpoints`;
    processNotesSubmission(mockImageText);
  };

  // Determine whether input dock should be active
  const isInputDisabled = step === 1 || step === 2 || step === 3 || step === 4;

  let disabledReason: string | undefined;
  if (step === 1) {
    disabledReason = 'Select or skip exam date in the chat thread above to continue';
  } else if (step === 2) {
    disabledReason = 'Choose your preferred language (English or Roman Urdu) above';
  } else if (step === 3) {
    disabledReason = 'Tap one or more study pack options above and click Generate';
  } else if (step === 4) {
    disabledReason = 'Generating your personalized study pack via AI…';
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0A0A] text-[#FCFCFC] overflow-hidden select-text relative">
      {/* Fallback Warning Toast (Slide-down from top) */}
      <WarningToast
        isVisible={isFallbackActive}
        onDismiss={() => setIsFallbackActive(false)}
      />

      {/* Floating App Notification Toast (File reading error or image hint) */}
      {appToast && (
        <div
          role="status"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-[12px] bg-[#1F1F1F] text-[#FCFCFC] border border-[#FFD166]/60 shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-top-3 max-w-[90vw]"
        >
          <AlertCircle className="w-4 h-4 text-[#FFD166] shrink-0" />
          <span>{appToast}</span>
        </div>
      )}

      {/* Header (fixed top, 56px) */}
      <Header
        onResetChat={handleResetChat}
        onToggleFallback={() => setIsFallbackActive((prev) => !prev)}
        isFallbackActive={isFallbackActive}
      />

      {/* Main Chat Thread (auto-scrolling, centered max-720px) */}
      <ChatThread
        step={step}
        messages={messages}
        studyPackData={studyPack}
        selectedFeatures={selectedFeatures}
        examDate={examDate}
        language={selectedLanguage}
        onExamDateChange={setExamDate}
        onSubmitExamDate={handleConfirmExamDate}
        onSkipExamDate={handleSkipExamDate}
        onSelectLanguage={handleSelectLanguage}
        onToggleFeature={handleToggleFeature}
        onSelectAllFeatures={handleSelectAllFeatures}
        onGeneratePack={handleGeneratePack}
        onLoadSampleNotes={handleLoadSampleNotes}
      />

      {/* Sticky Download Bar (appears directly above input dock once study pack is generated) */}
      {studyPack && step >= 5 && (
        <DownloadBar
          studyPack={studyPack}
          selectedFeatures={selectedFeatures}
          examDate={examDate}
          language={selectedLanguage}
        />
      )}

      {/* Input Dock (camera button + paperclip file upload + auto-grow textarea + send button) */}
      <InputDock
        value={inputText}
        onChange={setInputText}
        onSend={handleSendInput}
        onOpenCamera={() => setIsCameraOpen(true)}
        onFileUpload={handleFileUpload}
        isParsingFile={isParsingFile}
        disabled={isInputDisabled}
        disabledReason={disabledReason}
        placeholder={
          step === 0
            ? 'Paste your notes or ask a question…'
            : 'Ask a follow-up question about your notes…'
        }
      />

      {/* Camera Full-Screen Overlay */}
      <CameraOverlay
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
