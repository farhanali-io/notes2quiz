import React, { useState } from 'react';
import { X, User, School, Shield, Cpu, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

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
}) => {
  const [name, setName] = useState(studentName);
  const [role, setRole] = useState(studentRole);
  const [lang, setLang] = useState(defaultLanguage);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateStudentName(name.trim() || 'Farhan Ali');
    onUpdateStudentRole(role.trim() || 'FAST-NUCES • CS Project');
    onUpdateDefaultLanguage(lang);
    onClose();
  };

  const handleConfirmClear = () => {
    onClearAllCache();
    setShowClearConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0D101C] border border-[#1E253A] rounded-[16px] shadow-2xl overflow-hidden space-y-4">
        {/* Header */}
        <div className="p-4 border-b border-[#181C2C] flex items-center justify-between bg-[#111422]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-white">Student & App Settings</h3>
              <p className="text-[11px] text-[#788195]">Notes2Quiz University Profile & Cache</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#788195] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-[13px]">
          {/* Student Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A1]">
              Student Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Farhan Ali"
              className="w-full px-3 py-2 rounded-[8px] bg-[#141828] border border-[#1E253E] text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* University / Program */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A1]">
              University / Major
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="FAST-NUCES • Computer Science"
              className="w-full px-3 py-2 rounded-[8px] bg-[#141828] border border-[#1E253E] text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Default Language Preference */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A1]">
              Preferred Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLang('English')}
                className={`p-2 rounded-[8px] border text-center transition-all cursor-pointer ${
                  lang === 'English'
                    ? 'bg-indigo-950/50 border-indigo-500 text-white font-medium'
                    : 'bg-[#141828] border-[#1E253E] text-[#858E9F]'
                }`}
              >
                Academic English
              </button>
              <button
                type="button"
                onClick={() => setLang('Roman Urdu')}
                className={`p-2 rounded-[8px] border text-center transition-all cursor-pointer ${
                  lang === 'Roman Urdu'
                    ? 'bg-emerald-950/50 border-emerald-500 text-white font-medium'
                    : 'bg-[#141828] border-[#1E253E] text-[#858E9F]'
                }`}
              >
                Roman Urdu (اردو)
              </button>
            </div>
          </div>

          {/* Cache Management Section */}
          <div className="p-3.5 rounded-[10px] bg-[#111422] border border-[#1B2032] space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cached Data & Storage</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-300">
                {savedSessionsCount} Chats Saved
              </span>
            </div>
            <p className="text-[11px] text-[#788195]">
              All your lecture notes, study packs, and conversations are safely cached locally in your browser.
            </p>

            {showClearConfirm ? (
              <div className="p-2.5 rounded-[8px] bg-rose-950/30 border border-rose-500/40 space-y-2 text-[12px] text-rose-200">
                <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Delete all saved chats?</span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 rounded bg-[#181D2E] text-white text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-500"
                  >
                    Yes, Clear Cache
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 hover:underline pt-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Saved Chats & Cache</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#181C2C] bg-[#111422] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[8px] text-[12px] text-[#858E9F] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-[8px] bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[12px] font-semibold hover:opacity-95 cursor-pointer shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
