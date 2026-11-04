/**
 * Local storage caching manager for Notes2Quiz.
 * Emulates Claude-like persistent chat sessions, caching user notes,
 * study packs, conversation turns, and preferences.
 */

import { StudyPackData } from '../types/studyPack';
import { ChatMessage } from '../components/ChatThread';

export interface StoredSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  step: number; // 0 = empty/waiting, 1 = strategy options, 5 = pack generated, 6 = follow-up
  messages: ChatMessage[];
  rawNotes: string;
  studyPack: StudyPackData | null;
  selectedFeatures: string[];
  examDate: string;
  language: 'English' | 'Roman Urdu';
  category?: 'today' | 'previous';
}

export interface UserPreferences {
  studentName: string;
  studentRole: string;
  defaultLanguage: 'English' | 'Roman Urdu';
  isNightMode: boolean;
  notesProcessedCount: number;
}

const SESSIONS_STORAGE_KEY = 'notes2quiz_sessions_cache_v2';
const ACTIVE_SESSION_KEY = 'notes2quiz_active_session_id_v2';
const PREFS_STORAGE_KEY = 'notes2quiz_user_preferences_v2';

export const DEFAULT_PREFS: UserPreferences = {
  studentName: 'Farhan Ali',
  studentRole: 'FAST-NUCES • CS Project',
  defaultLanguage: 'English',
  isNightMode: true,
  notesProcessedCount: 0,
};

export function getCachedPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load cached preferences:', err);
  }
  return DEFAULT_PREFS;
}

export function saveCachedPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save preferences to cache:', err);
  }
}

export function getCachedSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed: StoredSession[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load cached sessions:', err);
  }
  return [];
}

export function saveCachedSessions(sessions: StoredSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions to cache:', err);
  }
}

export function getCachedActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setCachedActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } catch (err) {
    console.error('Failed to save active session ID:', err);
  }
}

export function createNewStoredSession(
  title: string = 'New Study Session',
  language: 'English' | 'Roman Urdu' = 'English'
): StoredSession {
  const now = Date.now();
  return {
    id: `session-${now}`,
    title,
    createdAt: now,
    updatedAt: now,
    step: 0,
    messages: [
      {
        id: `greeting-${now}`,
        sender: 'assistant',
        text: "Hi! I’m Notes2Quiz. Please paste your notes or upload a PDF/photo to get started.",
        timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    rawNotes: '',
    studyPack: null,
    selectedFeatures: ['exam_notes', 'mcqs', 'flashcards', 'key_points'],
    examDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    language,
    category: 'today',
  };
}

export function clearAllCachedData(): void {
  try {
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear cache:', err);
  }
}
