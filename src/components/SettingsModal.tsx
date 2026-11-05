import React, { useState } from 'react';
import { X, User, Trash2, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  studentRole: string;
  onUpdateStudentRole: (role: string) => void;
  defaultLanguage: 'English' | 'Roman Urdu';
  onUpdateDefaultLanguage: (lang: 'English' | 'Roman Urdu') => void;
  onClearAllCache: () => void;
  savedSessionsCount: number;
  isNightMode?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  studentName,
  onUpdateStudentName,
  studentRole,
  onUpdateStudentRole,
  defaultLanguage,
  onUpdateDefaultLanguage,
  onClearAllCache,
  savedSessionsCount,
  isNightMode = true,
}) => {
  const [name, setName] = useState(studentName);
  const [role, setRole] = useState(studentRole);
  const [lang, setLang] = useState(defaultLanguage);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateStudentName(name.trim() || 'Farhan Ali');
    onUpdateStudentRole(role.trim() || 'FAST-NUCES · CS Project');
    onUpdateDefaultLanguage(lang);
    onClose();
  };

  const handleConfirmClear = () => {
    onClearAllCache();
    setShowClearConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0B0C]/80 flex items-center justify-center p-4 select-none">
      <div
        className={`w-full max-w-md border rounded-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden ${
          isNightMode
            ? 'bg-[#141416] border-[#EDEDED]/15 text-[#EDEDED]'
            : 'bg-[#F2F1EC] border-[#1A1A1A]/15 text-[#1A1A1A]'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4" strokeWidth={1.5} />
            <h3 className="font-medium text-[15px] tracking-[-0.01em]">
              Student & app settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className={`p-1 rounded-[6px] transition-colors duration-150 cursor-pointer ${
              isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-[14px]">
          <div className="space-y-1.5">
            <label
              className={`block text-[12px] font-medium ${
                isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
              }`}
            >
              Student name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Farhan Ali"
              className={`w-full px-3 py-2 rounded-[6px] border outline-none focus:border-[#2D4A3E] ${
                isNightMode
                  ? 'bg-[#0B0B0C] border-[#EDEDED]/15 text-[#EDEDED]'
                  : 'bg-[#FAFAF7] border-[#1A1A1A]/15 text-[#1A1A1A]'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label
              className={`block text-[12px] font-medium ${
                isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
              }`}
            >
              University or major
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="FAST-NUCES · Computer Science"
              className={`w-full px-3 py-2 rounded-[6px] border outline-none focus:border-[#2D4A3E] ${
                isNightMode
                  ? 'bg-[#0B0B0C] border-[#EDEDED]/15 text-[#EDEDED]'
                  : 'bg-[#FAFAF7] border-[#1A1A1A]/15 text-[#1A1A1A]'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label
              className={`block text-[12px] font-medium ${
                isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
              }`}
            >
              Preferred language
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLang('English')}
                className={`p-2 rounded-[6px] border text-center text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  lang === 'English'
                    ? 'bg-[#2D4A3E] border-[#2D4A3E] text-[#EDEDED]'
                    : isNightMode
                    ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#8A8A8A]'
                    : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#6B6B6B]'
                }`}
              >
                Academic English
              </button>
              <button
                type="button"
                onClick={() => setLang('Roman Urdu')}
                className={`p-2 rounded-[6px] border text-center text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                  lang === 'Roman Urdu'
                    ? 'bg-[#2D4A3E] border-[#2D4A3E] text-[#EDEDED]'
                    : isNightMode
                    ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#8A8A8A]'
                    : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#6B6B6B]'
                }`}
              >
                Roman Urdu
              </button>
            </div>
          </div>

          {/* Cache Management */}
          <div
            className={`pt-4 border-t space-y-2 ${
              isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
            }`}
          >
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium">Local storage cache</span>
              <span className={isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'}>
                {savedSessionsCount} {savedSessionsCount === 1 ? 'chat' : 'chats'} saved
              </span>
            </div>

            {showClearConfirm ? (
              <div
                className={`p-3 rounded-[6px] border space-y-2 text-[13px] ${
                  isNightMode
                    ? 'bg-[#0B0B0C] border-[#EDEDED]/15'
                    : 'bg-[#FAFAF7] border-[#1A1A1A]/15'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>Delete all saved chats?</span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className={`px-2.5 py-1 rounded-[6px] text-[12px] cursor-pointer ${
                      isNightMode
                        ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                        : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-3 py-1 rounded-[6px] bg-[#7F2F2F] text-[#EDEDED] font-medium text-[12px] cursor-pointer"
                  >
                    Clear cache
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className={`flex items-center gap-1.5 text-[13px] hover:underline pt-1 cursor-pointer ${
                  isNightMode ? 'text-[#8A8A8A] hover:text-[#EDEDED]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Clear all saved chats</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-end gap-2 ${
            isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-3.5 py-1.5 rounded-[6px] text-[13px] cursor-pointer ${
              isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-[6px] bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] text-[13px] font-medium transition-colors duration-150 cursor-pointer"
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
};
