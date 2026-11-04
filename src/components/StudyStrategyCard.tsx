import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  GraduationCap,
  FileText,
  ListChecks,
  CheckCircle2,
  Calendar,
  EyeOff,
  Check,
  Target,
  Clock,
  HelpCircle,
  BookOpen,
  CalendarDays,
} from 'lucide-react';
import { FEATURE_CONFIGS } from '../types/studyPack';

interface StudyStrategyCardProps {
  notesWordCount?: number;
  extractedThemes?: string[];
  selectedFeatures: string[];
  onToggleFeature: (id: string) => void;
  onSelectAllFeatures: () => void;
  language: 'English' | 'Roman Urdu';
  onSelectLanguage: (lang: 'English' | 'Roman Urdu') => void;
  examDate: string;
  onExamDateChange: (date: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const StudyStrategyCard: React.FC<StudyStrategyCardProps> = ({
  notesWordCount = 380,
  extractedThemes = [
    'Glycolysis to Pyruvate Decarboxylation',
    'Krebs Substrates, Isomerases & NADH Yields',
    'Electron Transport Chain Complex I–IV Gradient',
    'ATP Synthase F0/F1 Chemiosmotic Coupling',
  ],
  selectedFeatures,
  onToggleFeature,
  onSelectAllFeatures,
  language,
  onSelectLanguage,
  examDate,
  onExamDateChange,
  onGenerate,
  isGenerating = false,
}) => {
  // Secondary tweak chips states
  const [includeDistractors, setIncludeDistractors] = useState(true);
  const [focusFormulas, setFocusFormulas] = useState(true);
  const [addMnemonics, setAddMnemonics] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getFeatureIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-4 h-4" style={{ color }} />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" style={{ color }} />;
      case 'FileText':
        return <FileText className="w-4 h-4" style={{ color }} />;
      case 'ListChecks':
        return <ListChecks className="w-4 h-4" style={{ color }} />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4" style={{ color }} />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" style={{ color }} />;
      case 'Calendar':
        return <Calendar className="w-4 h-4" style={{ color }} />;
      case 'EyeOff':
        return <EyeOff className="w-4 h-4" style={{ color }} />;
      default:
        return <Sparkles className="w-4 h-4" style={{ color }} />;
    }
  };

  const isAllSelected = selectedFeatures.includes('full_package');
  const selectedCount = isAllSelected ? 8 : selectedFeatures.length;

  const estimatedPages = Math.max(1, Math.ceil(notesWordCount / 220));

  return (
    <div className="rounded-[16px] bg-[#10131F] border border-[#1E2336] p-4 sm:p-6 text-[#FCFCFC] shadow-xl space-y-5 animate-in fade-in duration-300">
      {/* Bot Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1A2033] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-[#344CE4] to-[#14AC8C] text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] text-[#FCFCFC] tracking-tight">
                Notes2Quiz AI
              </span>
              <span className="text-[11px] text-[#737A8C]">• Academic Tutor</span>
            </div>
            <div className="text-[11px] text-indigo-400 font-mono">
              University Engine v2.5 (Fine-Tuned)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161B2B] border border-[#222B42] text-[11px] text-[#A1A1A1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14AC8C]" />
          <span>{estimatedPages} Pages Parsed</span>
        </div>
      </div>

      {/* Extracted Core Themes */}
      <div className="space-y-2">
        <p className="text-[13px] text-[#A1A1A1]">
          I've analyzed your notes. Extracted <strong className="text-[#FCFCFC] font-semibold">{extractedThemes.length} core high-yield themes:</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {extractedThemes.map((theme, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#141826] border border-[#1E253A] text-[12px] text-[#E2E8F0] font-medium"
            >
              <Target className="w-3.5 h-3.5 text-[#14AC8C] shrink-0" />
              <span className="truncate">{theme}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Choose Study Strategy Header & Select All */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-[#FCFCFC] tracking-tight">
            Choose study strategy:
          </h3>
          <p className="text-[11px] text-[#737A8C]">
            Targeting Midterm Readiness • Select one or more materials
          </p>
        </div>

        <button
          type="button"
          onClick={onSelectAllFeatures}
          className="text-[11px] font-semibold text-[#14AC8C] hover:text-[#18cba5] transition-colors cursor-pointer uppercase tracking-wider"
        >
          {isAllSelected ? 'Custom Selection' : 'Select All (Full Pack)'}
        </button>
      </div>

      {/* The 8 Selectable Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {FEATURE_CONFIGS.map((feat) => {
          const isSelected = selectedFeatures.includes(feat.id) || isAllSelected;

          return (
            <div
              key={feat.id}
              onClick={() => onToggleFeature(feat.id)}
              className={`relative p-3.5 rounded-[12px] transition-all duration-200 cursor-pointer select-none flex flex-col justify-between min-h-[130px] border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#181D30] to-[#121524] border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                  : 'bg-[#121624] border-[#1C2236] hover:border-[#2C3552] hover:bg-[#151A2B]'
              }`}
            >
              {/* Checkbox badge in top-right */}
              <div
                className={`absolute top-3 right-3 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-tr from-indigo-500 to-[#14AC8C] text-white shadow-sm'
                    : 'border border-[#2C3552] bg-[#0E111C]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              {/* Icon and Flagship indicator */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${feat.color}20` }}
                  >
                    {getFeatureIcon(feat.icon, feat.color)}
                  </div>
                  {feat.isFlagship && (
                    <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ★ Exam Standard
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-[13px] font-bold text-[#FCFCFC] leading-snug">
                    {feat.name}
                  </h4>
                  <p className="text-[11px] text-[#A1A1A1] leading-tight line-clamp-2 mt-1">
                    {feat.description}
                  </p>
                </div>
              </div>

              {/* Bottom Card Badges */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#1C2236] text-[10px] text-[#737A8C]">
                <span className="font-medium text-[#E2E8F0]">{feat.badge}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-[#525866]" />
                  {feat.duration}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter / Tweak Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setIncludeDistractors((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
            includeDistractors
              ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
              : 'bg-[#141826] border-[#1E253A] text-[#737A8C]'
          }`}
        >
          {includeDistractors && <Check className="w-3 h-3 text-indigo-400" />}
          <span>Include tricky distractors</span>
        </button>

        <button
          type="button"
          onClick={() => setFocusFormulas((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
            focusFormulas
              ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
              : 'bg-[#141826] border-[#1E253A] text-[#737A8C]'
          }`}
        >
          {focusFormulas && <Check className="w-3 h-3 text-indigo-400" />}
          <span>Focus on high-yield formulas</span>
        </button>

        <button
          type="button"
          onClick={() => setAddMnemonics((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
            addMnemonics
              ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
              : 'bg-[#141826] border-[#1E253A] text-[#737A8C]'
          }`}
        >
          {addMnemonics ? <Check className="w-3 h-3 text-indigo-400" /> : <span>+</span>}
          <span>Add Mnemonic Aids</span>
        </button>

        {/* Date picker toggle */}
        <button
          type="button"
          onClick={() => setShowDatePicker((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141826] border border-[#1E253A] text-[11px] font-medium text-[#A1A1A1] hover:text-white transition-colors cursor-pointer"
        >
          <CalendarDays className="w-3 h-3 text-[#14AC8C]" />
          <span>Exam: {examDate || 'Set Date'}</span>
        </button>
      </div>

      {/* Date Picker Input Box if expanded */}
      {showDatePicker && (
        <div className="p-3 rounded-[10px] bg-[#141826] border border-[#1E253A] flex items-center gap-3">
          <span className="text-[12px] text-[#A1A1A1]">Target Exam Date:</span>
          <input
            type="date"
            value={examDate}
            onChange={(e) => onExamDateChange(e.target.value)}
            className="bg-[#0E111C] border border-[#2A344E] text-[#FCFCFC] text-[13px] px-3 py-1.5 rounded-md outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowDatePicker(false)}
            className="text-[11px] font-medium text-[#14AC8C] hover:underline"
          >
            Done
          </button>
        </div>
      )}

      {/* Language Toggle in Card (Requirement 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-t border-[#1A2033]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#A1A1A1]">Study Material Language:</span>
          <div className="inline-flex rounded-lg bg-[#141826] p-0.5 border border-[#1E253A]">
            <button
              type="button"
              onClick={() => onSelectLanguage('English')}
              className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer ${
                language === 'English'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xs'
                  : 'text-[#A1A1A1] hover:text-white'
              }`}
            >
              Academic English
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('Roman Urdu')}
              className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer ${
                language === 'Roman Urdu'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                  : 'text-[#A1A1A1] hover:text-white'
              }`}
              title="Urdu in English letters (e.g. Yeh topic exam ke liye ahem hai)"
            >
              Roman Urdu (اردو)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#737A8C]">
          Generates instant interactive score key with rationale
        </div>
      </div>

      {/* Main Submit Button */}
      <button
        type="button"
        disabled={selectedCount === 0 || isGenerating}
        onClick={onGenerate}
        className={`w-full h-12 rounded-[12px] font-semibold text-[14px] sm:text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-lg ${
          selectedCount > 0 && !isGenerating
            ? 'bg-gradient-to-r from-[#344CE4] via-[#4F46E5] to-[#6366F1] text-white hover:opacity-95 active:scale-[0.99] shadow-indigo-950/60 ring-1 ring-white/10'
            : 'bg-[#181C2B] text-[#525866] cursor-not-allowed border border-[#22273D]'
        }`}
      >
        <Sparkles className="w-4 h-4 text-indigo-200" />
        <span>
          {isGenerating
            ? 'Generating Study Pack via AI…'
            : `Create Study Pack (${selectedCount} Selected)`}
        </span>
      </button>
    </div>
  );
};
