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
      className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 gap-3 transition-colors duration-150 ${
        isNightMode
          ? 'border-[#EDEDED]/10 bg-[#0B0B0C] text-[#EDEDED]'
          : 'border-[#1A1A1A]/10 bg-[#FAFAF7] text-[#1A1A1A]'
      }`}
    >
      {/* Left side: Sidebar expand button + Session Title + Plain text metadata */}
      <div className="flex items-center gap-3 min-w-0">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open navigation sidebar"
            title="Open sidebar"
            className={`px-2 py-1.5 rounded-[6px] transition-colors duration-150 cursor-pointer flex items-center gap-1.5 text-[13px] font-medium ${
              isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#141416]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F2F1EC]'
            }`}
          >
            <PanelLeftOpen className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span className="hidden sm:inline">Sidebar</span>
          </button>
        )}

        {/* Editable Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className={`text-[14px] font-medium px-2 py-1 rounded-[6px] border outline-none max-w-[200px] sm:max-w-[320px] ${
                  isNightMode
                    ? 'bg-[#141416] border-[#EDEDED]/20 text-[#EDEDED] focus:border-[#2D4A3E]'
                    : 'bg-[#F2F1EC] border-[#1A1A1A]/20 text-[#1A1A1A] focus:border-[#2D4A3E]'
                }`}
              />
              <button
                type="button"
                onClick={handleTitleSubmit}
                className="p-1 text-[#EDEDED] bg-[#2D4A3E] rounded-[6px] cursor-pointer transition-colors duration-150"
              >
                <Check className="w-4 h-4" strokeWidth={1.5} />
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
                className={`font-medium text-[14px] sm:text-[15px] tracking-[-0.01em] truncate max-w-[160px] sm:max-w-[340px] ${
                  isNightMode ? 'text-[#EDEDED]' : 'text-[#1A1A1A]'
                }`}
              >
                {sessionTitle}
              </h1>
              <Edit2
                className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity duration-150 ${
                  isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                }`}
                strokeWidth={1.5}
              />
            </div>
          )}

          {/* Plain text metadata (no pill, no background, no border) */}
          {isQuizReady && (
            <span
              className={`hidden lg:inline text-[12px] shrink-0 ${
                isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
              }`}
            >
              · {questionCount} questions ready
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: Language segmented control + Share + Theme toggle + Avatar dot */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language Segmented Control */}
        <div
          className={`flex items-center rounded-[6px] p-0.5 text-[12px] border ${
            isNightMode
              ? 'bg-[#141416] border-[#EDEDED]/10'
              : 'bg-[#F2F1EC] border-[#1A1A1A]/10'
          }`}
        >
          <button
            type="button"
            onClick={() => onToggleLanguage('English')}
            className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors duration-150 cursor-pointer ${
              language === 'English'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onToggleLanguage('Roman Urdu')}
            className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors duration-150 cursor-pointer ${
              language === 'Roman Urdu'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
            title="Roman Urdu mode (Urdu in English alphabet)"
          >
            Roman Urdu
          </button>
        </div>

        {/* Share Button (Plain text secondary button) */}
        <button
          type="button"
          onClick={onShareSession}
          title="Share study session"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
            isNightMode
              ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#141416]'
              : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F2F1EC]'
          }`}
        >
          <Share2 className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Single Theme Toggle */}
        <button
          type="button"
          onClick={onToggleNightMode}
          title={isNightMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isNightMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`p-1.5 rounded-[6px] transition-colors duration-150 cursor-pointer ${
            isNightMode
              ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#141416]'
              : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F2F1EC]'
          }`}
        >
          {isNightMode ? (
            <Sun className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>

        {/* User Avatar Dot */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Profile and settings"
          aria-label="Profile and settings"
          className="w-7 h-7 rounded-full bg-[#2D4A3E] text-[#EDEDED] flex items-center justify-center text-[12px] font-medium cursor-pointer transition-opacity duration-150 hover:opacity-90"
        >
          {studentName.slice(0, 1).toUpperCase()}
        </button>
      </div>
    </header>
  );
};
