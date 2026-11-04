import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Share2,
  Edit2,
  Check,
  PanelLeftOpen,
} from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  sessionTitle: string;
  onUpdateSessionTitle: (title: string) => void;
  onShareSession: () => void;
  onOpenSettings: () => void;
  isQuizReady: boolean;
  questionCount?: number;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  language: 'English' | 'Roman Urdu';
  onToggleLanguage: (lang: 'English' | 'Roman Urdu') => void;
  studentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  sessionTitle,
  onUpdateSessionTitle,
  onShareSession,
  onOpenSettings,
  isQuizReady,
  questionCount = 15,
  isNightMode,
  onToggleNightMode,
  language,
  onToggleLanguage,
  studentName = 'Farhan Ali',
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(sessionTitle);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onUpdateSessionTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header
      className={`h-14 border-b px-3.5 sm:px-5 flex items-center justify-between shrink-0 select-none z-20 gap-3 transition-colors ${
        isNightMode
          ? 'border-[#181C2C] bg-[#0A0C14] text-[#FCFCFC]'
          : 'border-[#E2E8F0] bg-white text-[#0F172A] shadow-xs'
      }`}
    >
      {/* Left side: Working sidebar toggle (when sidebar is closed) + Session Title + Active Quiz badge */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open navigation sidebar"
            title="Open sidebar"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-[12px] font-medium ${
              isNightMode
                ? 'text-[#788195] hover:text-white hover:bg-[#141828]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PanelLeftOpen className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">Sidebar</span>
          </button>
        )}

        {/* Editable Title */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className={`text-[14px] font-semibold px-2 py-0.5 rounded border border-indigo-500 outline-none max-w-[200px] sm:max-w-[320px] ${
                  isNightMode ? 'bg-[#121626] text-white' : 'bg-slate-50 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={handleTitleSubmit}
                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setTitleInput(sessionTitle);
                setIsEditingTitle(true);
              }}
              title="Click to rename session"
              className="flex items-center gap-1.5 cursor-pointer group min-w-0"
            >
              <h1
                className={`font-semibold text-[13px] sm:text-[15px] tracking-tight truncate max-w-[150px] sm:max-w-[320px] ${
                  isNightMode ? 'text-[#FCFCFC]' : 'text-slate-900'
                }`}
              >
                {sessionTitle}
              </h1>
              <Edit2 className="w-3 h-3 text-transparent group-hover:text-[#788195] shrink-0 transition-colors" />
            </div>
          )}

          {/* Active Quiz Ready Badge */}
          {isQuizReady && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[11px] font-medium shrink-0 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Study Pack Ready • {questionCount} MCQs</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Language toggle + Share + Theme toggle + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Language Segmented Toggle (English / Roman Urdu) */}
        <div
          className={`flex items-center rounded-full p-0.5 text-[11px] border ${
            isNightMode
              ? 'bg-[#111422] border-[#1C2236]'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => onToggleLanguage('English')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              language === 'English'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xs'
                : isNightMode
                ? 'text-[#858E9F] hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onToggleLanguage('Roman Urdu')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              language === 'Roman Urdu'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                : isNightMode
                ? 'text-[#858E9F] hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Roman Urdu mode (Urdu in English alphabet)"
          >
            Urdu (Roman)
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={onShareSession}
          title="Share Study Session"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium transition-colors cursor-pointer ${
            isNightMode
              ? 'bg-[#111422] hover:bg-[#181D30] border-[#1C2236] text-[#A1A1A1] hover:text-white'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Single Theme Toggle (Header only) */}
        <button
          type="button"
          onClick={onToggleNightMode}
          title={isNightMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isNightMode
              ? 'text-[#FFD166] hover:bg-[#181D30]'
              : 'text-amber-600 hover:bg-slate-100'
          }`}
        >
          {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Settings / User Avatar */}
        <div
          onClick={onOpenSettings}
          title="Profile & Settings"
          className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 p-[1px] cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all"
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center ${
              isNightMode ? 'bg-[#0A0C14]' : 'bg-white'
            }`}
          >
            <span
              className={`text-[10px] font-bold ${
                isNightMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              {studentName.slice(0, 1)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
