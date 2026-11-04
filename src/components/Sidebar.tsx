import React, { useState } from 'react';
import {
  Plus,
  Settings,
  GraduationCap,
  Trash2,
  Edit2,
  Check,
  PanelLeftClose,
  MessageSquare,
} from 'lucide-react';
import { StoredSession } from '../utils/storage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StoredSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  studentName?: string;
  studentRole?: string;
  notesProcessedCount?: number;
  notesTotalLimit?: number;
  isNightMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
  studentName = 'Farhan Ali',
  studentRole = 'FAST-NUCES • CS Project',
  notesProcessedCount = 0,
  notesTotalLimit = 50,
  isNightMode = true,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  // Group sessions by Today and Previous
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const todaySessions = sessions.filter((s) => now - s.createdAt < oneDayMs);
  const previousSessions = sessions.filter((s) => now - s.createdAt >= oneDayMs);

  const handleStartRename = (e: React.MouseEvent, s: StoredSession) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitleInput(s.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitleInput.trim()) {
      onRenameSession(id, editTitleInput.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSession(id);
  };

  const progressPercent = Math.min(100, Math.round((notesProcessedCount / notesTotalLimit) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[270px] border-r flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 select-none ${
          isNightMode
            ? 'bg-[#0A0C14] border-[#191D2C] text-[#FCFCFC]'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Bar */}
          <div
            className={`h-14 px-3.5 flex items-center justify-between border-b ${
              isNightMode ? 'border-[#161A28]' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[9px] bg-gradient-to-tr from-[#344CE4] via-[#4F46E5] to-[#14AC8C] text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[14px] tracking-tight flex items-center gap-1.5">
                  Notes2Quiz
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-400">
                    AI Tutor
                  </span>
                </span>
                <span className="text-[10px] text-[#788195] -mt-0.5">
                  University Exam Engine
                </span>
              </div>
            </div>

            {/* Close toggle button (working sidebar collapse button) */}
            <button
              type="button"
              onClick={onClose}
              title="Collapse sidebar"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isNightMode
                  ? 'text-[#788195] hover:text-white hover:bg-[#141828]'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action: + Start new chat (Keep ONLY here) */}
          <div className="p-3">
            <button
              type="button"
              onClick={() => {
                onNewSession();
                if (window.innerWidth < 768) onClose();
              }}
              className={`w-full h-10 rounded-[10px] font-medium text-[13px] flex items-center justify-between px-3 border transition-all cursor-pointer group shadow-xs ${
                isNightMode
                  ? 'bg-[#141727] hover:bg-[#1A1F33] text-[#FCFCFC] border-[#22273D] hover:border-indigo-500/50'
                  : 'bg-indigo-50 hover:bg-indigo-100/70 text-indigo-900 border-indigo-200'
              }`}
            >
              <span className="flex items-center gap-2 text-indigo-500 group-hover:text-indigo-600 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="font-semibold">Start new chat</span>
              </span>
              <kbd
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  isNightMode
                    ? 'bg-black/40 text-[#788195] border-white/10'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Recents Chat List */}
          <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-4 text-[12px] scrollbar-thin">
            {sessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-[#636C82] text-[12px]">
                No study sessions yet. Upload notes to get started!
              </div>
            ) : (
              <>
                {/* TODAY */}
                {todaySessions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#636C82] px-2.5">
                      Today
                    </span>
                    <div className="space-y-0.5">
                      {todaySessions.map((session) => {
                        const isActive = session.id === activeSessionId;
                        const isEditingThis = editingId === session.id;

                        return (
                          <div
                            key={session.id}
                            onClick={() => {
                              if (!isEditingThis) {
                                onSelectSession(session.id);
                                if (window.innerWidth < 768) onClose();
                              }
                            }}
                            className={`group w-full px-2.5 py-2 rounded-[8px] flex items-center justify-between transition-all cursor-pointer border ${
                              isActive
                                ? isNightMode
                                  ? 'bg-[#151928] border-indigo-500/40 text-[#FCFCFC] font-medium shadow-xs'
                                  : 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium shadow-xs'
                                : isNightMode
                                ? 'bg-transparent border-transparent text-[#9DA6B8] hover:text-[#FCFCFC] hover:bg-[#121524]'
                                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            {isEditingThis ? (
                              <div
                                className="flex items-center gap-1.5 w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editTitleInput}
                                  onChange={(e) => setEditTitleInput(e.target.value)}
                                  onBlur={() => handleSaveRename(session.id)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(session.id)}
                                  autoFocus
                                  className={`w-full text-[12px] px-2 py-0.5 rounded border border-indigo-500 outline-none ${
                                    isNightMode ? 'bg-[#0E111C] text-white' : 'bg-white text-slate-900'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRename(session.id)}
                                  className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                                  <MessageSquare
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isActive ? 'text-indigo-500' : 'text-[#636C82]'
                                    }`}
                                  />
                                  <span className="truncate">{session.title}</span>
                                </div>

                                {/* Hover actions: Rename + Delete */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(e, session)}
                                    title="Rename chat"
                                    className={`p-1 rounded ${
                                      isNightMode
                                        ? 'hover:text-white text-[#788195] hover:bg-[#1C2136]'
                                        : 'hover:text-slate-900 text-slate-400 hover:bg-slate-200'
                                    }`}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDelete(e, session.id)}
                                    title="Delete chat"
                                    className={`p-1 rounded ${
                                      isNightMode
                                        ? 'hover:text-rose-400 text-[#788195] hover:bg-[#1C2136]'
                                        : 'hover:text-rose-600 text-slate-400 hover:bg-rose-50'
                                    }`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PREVIOUS CHATS */}
                {previousSessions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#636C82] px-2.5">
                      Previous Sessions
                    </span>
                    <div className="space-y-0.5">
                      {previousSessions.map((session) => {
                        const isActive = session.id === activeSessionId;
                        const isEditingThis = editingId === session.id;

                        return (
                          <div
                            key={session.id}
                            onClick={() => {
                              if (!isEditingThis) {
                                onSelectSession(session.id);
                                if (window.innerWidth < 768) onClose();
                              }
                            }}
                            className={`group w-full px-2.5 py-2 rounded-[8px] flex items-center justify-between transition-all cursor-pointer border ${
                              isActive
                                ? isNightMode
                                  ? 'bg-[#151928] border-indigo-500/40 text-[#FCFCFC] font-medium shadow-xs'
                                  : 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium shadow-xs'
                                : isNightMode
                                ? 'bg-transparent border-transparent text-[#9DA6B8] hover:text-[#FCFCFC] hover:bg-[#121524]'
                                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            {isEditingThis ? (
                              <div
                                className="flex items-center gap-1.5 w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editTitleInput}
                                  onChange={(e) => setEditTitleInput(e.target.value)}
                                  onBlur={() => handleSaveRename(session.id)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(session.id)}
                                  autoFocus
                                  className={`w-full text-[12px] px-2 py-0.5 rounded border border-indigo-500 outline-none ${
                                    isNightMode ? 'bg-[#0E111C] text-white' : 'bg-white text-slate-900'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRename(session.id)}
                                  className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                                  <MessageSquare
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isActive ? 'text-indigo-500' : 'text-[#636C82]'
                                    }`}
                                  />
                                  <span className="truncate">{session.title}</span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(e, session)}
                                    title="Rename chat"
                                    className={`p-1 rounded ${
                                      isNightMode
                                        ? 'hover:text-white text-[#788195] hover:bg-[#1C2136]'
                                        : 'hover:text-slate-900 text-slate-400 hover:bg-slate-200'
                                    }`}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDelete(e, session.id)}
                                    title="Delete chat"
                                    className={`p-1 rounded ${
                                      isNightMode
                                        ? 'hover:text-rose-400 text-[#788195] hover:bg-[#1C2136]'
                                        : 'hover:text-rose-600 text-slate-400 hover:bg-rose-50'
                                    }`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Section: Profile + Settings (Theme toggle removed) */}
        <div
          className={`p-3 border-t space-y-2.5 ${
            isNightMode ? 'border-[#161A28] bg-[#0B0D16]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          {/* Notes Processed Meter */}
          <div
            className={`p-2.5 rounded-[10px] border space-y-1.5 ${
              isNightMode
                ? 'bg-[#111422] border-[#1B2032]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className={isNightMode ? 'text-[#858E9F]' : 'text-slate-500'}>
                Notes Processed
              </span>
              <span className="font-mono text-[11px] font-semibold">
                {notesProcessedCount}{' '}
                <span className={isNightMode ? 'text-[#636C82]' : 'text-slate-400'}>
                  / {notesTotalLimit}
                </span>
              </span>
            </div>
            <div
              className={`w-full h-1.5 rounded-full overflow-hidden ${
                isNightMode ? 'bg-[#181D2E]' : 'bg-slate-200'
              }`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#14AC8C] to-[#344CE4] transition-all duration-500"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* User Profile Bar (Click opens Settings) */}
          <div className="flex items-center justify-between p-1">
            <button
              type="button"
              onClick={onOpenSettings}
              className={`flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-[8px] text-left transition-colors cursor-pointer group ${
                isNightMode ? 'hover:bg-[#141828]' : 'hover:bg-slate-200/60'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 p-[1.5px] shrink-0">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${
                    isNightMode ? 'bg-[#0A0C14]' : 'bg-white'
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold ${
                      isNightMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {studentName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold truncate group-hover:text-indigo-500 transition-colors">
                  {studentName}
                </span>
                <span className="text-[10px] text-[#636C82] truncate">
                  {studentRole}
                </span>
              </div>
            </button>

            {/* Settings Icon */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings & Cache"
              className={`p-2 rounded-[8px] transition-colors cursor-pointer ${
                isNightMode
                  ? 'text-[#788195] hover:text-white hover:bg-[#141828]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
