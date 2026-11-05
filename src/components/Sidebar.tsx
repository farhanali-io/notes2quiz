import React, { useState } from 'react';
import {
  Plus,
  Settings,
  BookOpen,
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
  studentRole = 'FAST-NUCES · CS Project',
  notesProcessedCount = 0,
  notesTotalLimit = 50,
  isNightMode = true,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

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
      {/* Mobile Backdrop (solid scrim, no backdrop-blur) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#0B0B0C]/80 z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[264px] border-r flex flex-col justify-between transition-colors duration-150 shrink-0 select-none ${
          isNightMode
            ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#EDEDED]'
            : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#1A1A1A]'
        } ${isOpen ? 'flex' : 'hidden'}`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Bar */}
          <div
            className={`h-14 px-4 flex items-center justify-between border-b ${
              isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="font-semibold text-[15px] tracking-[-0.01em]">
                Notes2Quiz
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className={`p-1.5 rounded-[6px] transition-colors duration-150 cursor-pointer ${
                isNightMode
                  ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#141416]'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F2F1EC]'
              }`}
            >
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Primary Action: Start new chat */}
          <div className="p-3">
            <button
              type="button"
              onClick={() => {
                onNewSession();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full h-9 rounded-[6px] bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] font-medium text-[13px] flex items-center justify-between px-3 transition-colors duration-150 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>Start new chat</span>
              </span>
              <span className="text-[12px] text-[#EDEDED]/70">⌘K</span>
            </button>
          </div>

          {/* Recents Chat List */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-6 text-[13px]">
            {sessions.length === 0 ? (
              <div
                className={`px-2 py-6 text-[13px] ${
                  isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                }`}
              >
                No study sessions yet.
              </div>
            ) : (
              <>
                {/* Today */}
                {todaySessions.length > 0 && (
                  <div className="space-y-1">
                    <div
                      className={`text-[12px] font-medium px-2 py-1 ${
                        isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      Today
                    </div>
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
                            className={`group w-full px-2.5 py-2 rounded-[6px] flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                              isActive
                                ? isNightMode
                                  ? 'bg-[#141416] text-[#EDEDED] font-medium'
                                  : 'bg-[#F2F1EC] text-[#1A1A1A] font-medium'
                                : isNightMode
                                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#141416]/60'
                                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F2F1EC]/60'
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
                                  className={`w-full text-[13px] px-2 py-0.5 rounded-[4px] border outline-none ${
                                    isNightMode
                                      ? 'bg-[#0B0B0C] border-[#EDEDED]/20 text-[#EDEDED]'
                                      : 'bg-[#FAFAF7] border-[#1A1A1A]/20 text-[#1A1A1A]'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRename(session.id)}
                                  className="p-1 text-[#EDEDED] bg-[#2D4A3E] rounded-[4px]"
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                                  <MessageSquare
                                    className="w-3.5 h-3.5 shrink-0"
                                    strokeWidth={1.5}
                                  />
                                  <span className="truncate">{session.title}</span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(e, session)}
                                    title="Rename chat"
                                    className={`p-1 rounded-[4px] transition-colors duration-150 ${
                                      isNightMode
                                        ? 'hover:text-[#EDEDED] text-[#8A8A8A]'
                                        : 'hover:text-[#1A1A1A] text-[#6B6B6B]'
                                    }`}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDelete(e, session.id)}
                                    title="Delete chat"
                                    className={`p-1 rounded-[4px] transition-colors duration-150 ${
                                      isNightMode
                                        ? 'hover:text-[#EDEDED] text-[#8A8A8A]'
                                        : 'hover:text-[#1A1A1A] text-[#6B6B6B]'
                                    }`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
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

                {/* Previous Sessions */}
                {previousSessions.length > 0 && (
                  <div className="space-y-1">
                    <div
                      className={`text-[12px] font-medium px-2 py-1 ${
                        isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      Previous sessions
                    </div>
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
                            className={`group w-full px-2.5 py-2 rounded-[6px] flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                              isActive
                                ? isNightMode
                                  ? 'bg-[#141416] text-[#EDEDED] font-medium'
                                  : 'bg-[#F2F1EC] text-[#1A1A1A] font-medium'
                                : isNightMode
                                ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#141416]/60'
                                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F2F1EC]/60'
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
                                  className={`w-full text-[13px] px-2 py-0.5 rounded-[4px] border outline-none ${
                                    isNightMode
                                      ? 'bg-[#0B0B0C] border-[#EDEDED]/20 text-[#EDEDED]'
                                      : 'bg-[#FAFAF7] border-[#1A1A1A]/20 text-[#1A1A1A]'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRename(session.id)}
                                  className="p-1 text-[#EDEDED] bg-[#2D4A3E] rounded-[4px]"
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                                  <MessageSquare
                                    className="w-3.5 h-3.5 shrink-0"
                                    strokeWidth={1.5}
                                  />
                                  <span className="truncate">{session.title}</span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(e, session)}
                                    title="Rename chat"
                                    className={`p-1 rounded-[4px] transition-colors duration-150 ${
                                      isNightMode
                                        ? 'hover:text-[#EDEDED] text-[#8A8A8A]'
                                        : 'hover:text-[#1A1A1A] text-[#6B6B6B]'
                                    }`}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDelete(e, session.id)}
                                    title="Delete chat"
                                    className={`p-1 rounded-[4px] transition-colors duration-150 ${
                                      isNightMode
                                        ? 'hover:text-[#EDEDED] text-[#8A8A8A]'
                                        : 'hover:text-[#1A1A1A] text-[#6B6B6B]'
                                    }`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
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

        {/* Bottom Section: Notes Processed + Profile & Settings */}
        <div
          className={`p-3 border-t space-y-3 ${
            isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
          }`}
        >
          {/* Notes Processed */}
          <div className="px-1 space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className={isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'}>
                Notes processed
              </span>
              <span className="font-medium">
                {notesProcessedCount} / {notesTotalLimit}
              </span>
            </div>
            <div
              className={`w-full h-1 overflow-hidden ${
                isNightMode ? 'bg-[#1C1C1F]' : 'bg-[#E8E6DF]'
              }`}
            >
              <div
                className="h-full bg-[#2D4A3E] transition-opacity duration-150"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* User Profile & Settings */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onOpenSettings}
              className={`flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-[6px] text-left transition-colors duration-150 cursor-pointer ${
                isNightMode ? 'hover:bg-[#141416]' : 'hover:bg-[#F2F1EC]'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#2D4A3E] text-[#EDEDED] flex items-center justify-center text-[12px] font-medium shrink-0">
                {studentName.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium truncate">
                  {studentName}
                </span>
                <span
                  className={`text-[12px] truncate ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  {studentRole.replace('•', '·')}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings"
              aria-label="Settings"
              className={`p-1.5 rounded-[6px] transition-colors duration-150 cursor-pointer ${
                isNightMode
                  ? 'text-[#8A8A8A] hover:text-[#EDEDED] hover:bg-[#141416]'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F2F1EC]'
              }`}
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
