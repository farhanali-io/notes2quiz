import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatThread, ChatMessage } from './components/ChatThread';
import { InputDock } from './components/InputDock';
import { DownloadBar } from './components/DownloadBar';
import { CameraOverlay } from './components/CameraOverlay';
import { WarningToast } from './components/WarningToast';
import {
  MOCK_STUDY_PACK_EN,
  MOCK_STUDY_PACK_UR,
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

  // Active study pack generated
  const [studyPack, setStudyPack] = useState<StudyPackData | null>(null);

  // Dedicated conversation history for follow-up Q&A (Bug 3)
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

  // User uploads document file (.pdf, .docx, .txt, .md) - BUG 1
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

  // Step 4 -> 5: Generate Study Pack
  const handleGeneratePack = () => {
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

    // Simulate AI generation pipeline (TODO: Replace with actual Gemini backend endpoint)
    setTimeout(() => {
      const generatedPack =
        selectedLanguage === 'Roman Urdu' ? MOCK_STUDY_PACK_UR : MOCK_STUDY_PACK_EN;

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
    }, 2400);
  };

  /**
   * Generates a contextually accurate answer for follow-up questions
   * based on the user's specific query and study notes.
   */
  const generateFollowupResponse = (query: string, history: ConversationTurn[]) => {
    const q = query.toLowerCase();
    const isUrdu = selectedLanguage === 'Roman Urdu';

    if (q.includes('detail') || q.includes('more') || q.includes('explain') || q.includes('elaborate')) {
      if (isUrdu) {
        return `Tafseeli wazahat: Cell cycle ko control karne ke liye teen ahem checkpoints hotay hain: G1/S, G2/M, aur Spindle Assembly Checkpoint (SAC). Jab tak cell verify na kar le ke DNA ki replication bilkul theek hui hai aur saari spindle fibers chromatids ke kinetochores par jud chuki hain, cell aglay phase mein enter nahi hota. Yeh regulation cancer aur tumors se bachane ke liye zaroori hai.`;
      }
      return `Here is a detailed breakdown: The cell cycle is governed by Cyclin-Dependent Kinases (CDKs) bound to regulatory Cyclins. At the G1/S restriction point, p53 monitors DNA integrity via ATM/ATR kinases. During Metaphase, the Spindle Assembly Checkpoint (SAC) ensures bi-oriented tension across opposing kinetochores. Only when every chromosome is properly aligned does the APC/C complex degrade Securin, activating Separase to cleave cohesin rings and trigger Anaphase.`;
    }

    if (q.includes('p53') || q.includes('cancer') || q.includes('tumor') || q.includes('checkpoint')) {
      if (isUrdu) {
        return `p53 protein ko 'Guardian of the Genome' kaha jata hai. Agar DNA mein koi damage ho, to p53 cell cycle ko G1 phase mein rok kar repair enzymes ko bulata hai. Agar nuksan theek na ho sake, to yeh apoptosis (cell suicide) trigger karta hai taake abnormal cell divide na ho sake. Is gene ki mutation 50% se zyada cancers ki wajah banti hai.`;
      }
      return `p53 is known as the "guardian of the genome." When double-strand DNA breaks occur, p53 accumulates and acts as a transcription factor for p21, a CDK inhibitor that arrests the cell in G1. If DNA repair is impossible, p53 upregulates pro-apoptotic factors (like BAX and PUMA) to induce programmed cell death, preventing oncogenic mutations from propagating.`;
    }

    if (q.includes('cytokinesis') || q.includes('plant') || q.includes('animal') || q.includes('plate') || q.includes('furrow')) {
      if (isUrdu) {
        return `Cytokinesis ka bunyadi farq: Animal cells mein cell wall nahi hoti, is liye actin aur myosin microfilaments ka ring bahir se andar ki taraf pinch kar ke cleavage furrow banata hai. Plant cells mein rigid cellulose wall hoti hai, is liye Golgi apparatus se vesicles cell ke darmiyan jama ho kar andar se bahir 'cell plate' banate hain.`;
      }
      return `Cytokinesis differs fundamentally due to cell walls: Animal cells employ an actin-myosin II contractile ring that constricts the plasma membrane inward, forming a cleavage furrow (centripetal). Plant cells cannot pinch due to their rigid cellulose cell wall; instead, Golgi-derived secretory vesicles coalesce along the phragmoplast from the center outward, forming a pectin-rich cell plate (centrifugal).`;
    }

    if (q.includes('exam') || q.includes('mark') || q.includes('paper') || q.includes('tip') || q.includes('score')) {
      if (isUrdu) {
        return `University exam ke liye scoring tip: 7-mark ke long question mein hamesha chaaron marahil (Prophase, Metaphase, Anaphase, Telophase) ki neat pencil diagram zaroor banayein. Kinetochore, centrosome, aur metaphase plate ko wazeh label karein. Short questions mein G0 phase ki definition aur p53 ka role lazmi pucha jata hai.`;
      }
      return `University exam tip for 7-mark questions: Always draw neat diagrams for each of the four PMAT stages showing centriole migration and spindle attachment. Explicitly highlight key terms: "kinetochores", "equatorial plate alignment", "cohesin cleavage by separase", and "nuclear envelope reformation". Examiners award specific marks for clear labeling and distinguishing animal vs. plant cytokinesis.`;
    }

    // Default contextual answer directly answering what was typed
    if (isUrdu) {
      return `Aapke sawaal "${query}" ke mutabiq: Cell division mein accuracy sab se ahem hoti hai. Agar chromosome separation mein koi khata ho jaye to aneuploidy (ghalat chromosome tadaad) peda hoti hai. Mazeed tafseel ya kisi khaas marhalay (Prophase, Metaphase waghera) ke baray mein mazeed poochna chahein to batayein!`;
    }
    return `Addressing your question on "${query}": Based on your cell cycle notes, mitotic fidelity ensures that each daughter nucleus receives an exact chromosomal complement (2n). Checkpoint cascades guarantee that cellular resources, DNA replication fidelity, and microtubule tension are fully satisfied prior to each transitional phase. Would you like a simpler breakdown, a past-paper question, or a deep dive into a specific phase?`;
  };

  // Step 6: Follow-up question & answer with full conversation context (BUG 3)
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

    setInputText('');

    // Append user turn to full conversation history
    const newUserTurn: ConversationTurn = { role: 'user', content: text };
    const updatedHistory = [...conversationTurns, newUserTurn];

    // Guard: trim conversation history to last 6–8 messages to prevent losing focus
    const trimmedHistory = updatedHistory.slice(-8);

    // Context format for backend / Gemini API integration:
    // const payload = {
    //   systemInstruction: `You are Notes2Quiz, an expert study assistant for university students. Notes: ${rawNotes}`,
    //   messages: trimmedHistory, // role + content
    // };

    // Generate responsive, contextual tutor response
    const botResponse = generateFollowupResponse(text, trimmedHistory);

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

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setStep(6);
  };

  // Contextual action chips handler ("Simplify", "Make harder", "Regenerate")
  const handleContextAction = (action: 'Simplify' | 'Make harder' | 'Regenerate', lastTopic = '') => {
    let responseText = '';
    const isUrdu = selectedLanguage === 'Roman Urdu';

    if (action === 'Simplify') {
      responseText = isUrdu
        ? 'Asaan lafzon mein: Socho cell division ek factory ki quality control line hai. Har step par ek security guard khara hai. Agar blueprint (DNA) mein koi kharabi ho to guard foran alarm baja kar machine rok deta hai.'
        : 'Simple analogy: Think of cell division as a quality control assembly line. Every station has a strict inspector. If a single page of the blueprint is torn, the inspector halts the conveyor belt until it is fixed or recycled.';
    } else if (action === 'Make harder') {
      responseText = isUrdu
        ? 'Advanced University Challenge: Explain the role of the Mad1-Mad2 tension sensor complex at kinetochores in suppressing Cdc20 activity during unattached metaphase alignment.'
        : 'Advanced University Challenge: Detail how the Mad1-Mad2 complex at unattached kinetochores inhibits Cdc20, preventing premature activation of the Anaphase-Promoting Complex (APC/C) and cohesin degradation.';
    } else {
      responseText = isUrdu
        ? 'Refreshed Practice Question: Prophase aur Telophase aik doosre ke bilkul ulat (reverse) kyun kehlate hain? (Nuclear envelope aur chromatin packaging ke baray mein sochein).'
        : 'Refreshed Practice Question: Why is Telophase known as the exact molecular reverse of Prophase? Notice how the nuclear lamina, nucleolus, and chromosome condensation undergo mirror-image transitions.';
    }

    // Append to conversation history
    const chipUserTurn: ConversationTurn = { role: 'user', content: `${action} explanation` };
    const chipAssistantTurn: ConversationTurn = { role: 'assistant', content: responseText };
    setConversationTurns((prev) => [...prev.slice(-7), chipUserTurn, chipAssistantTurn]);

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

    setMessages((prev) => [...prev, chipReply]);
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
    disabledReason = 'Generating your personalized study pack…';
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
