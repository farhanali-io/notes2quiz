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
  isNightMode?: boolean;
}

export const StudyStrategyCard: React.FC<StudyStrategyCardProps> = ({
  notesWordCount = 380,
  extractedThemes = [
    'Glycolysis to Pyruvate Decarboxylation',
    'Krebs Substrates, Isomerases & NADH Yields',
    'Electron Transport Chain Complex I-IV Gradient',
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
  isNightMode = true,
}) => {
  const [includeDistractors, setIncludeDistractors] = useState(true);
  const [focusFormulas, setFocusFormulas] = useState(true);
  const [addMnemonics, setAddMnemonics] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'FileText':
        return <FileText className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'ListChecks':
        return <ListChecks className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'EyeOff':
        return <EyeOff className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      default:
        return <Sparkles className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
    }
  };

  const isAllSelected = selectedFeatures.includes('full_package');
  const selectedCount = isAllSelected ? 8 : selectedFeatures.length;
  const estimatedPages = Math.max(1, Math.ceil(notesWordCount / 220));

  return (
    <div
      className={`rounded-none p-5 sm:p-6 space-y-6 transition-colors duration-150 ${
        isNightMode
          ? 'bg-[#141416] text-[#EDEDED]'
          : 'bg-[#F2F1EC] text-[#1A1A1A]'
      }`}
    >
      {/* Header Row */}
      <div
        className={`flex items-center justify-between pb-4 border-b gap-3 ${
          isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          <span className="font-medium text-[15px] tracking-[-0.01em]">
            Notes2Quiz Study Configuration
          </span>
        </div>

        <span
          className={`text-[12px] ${
            isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
          }`}
        >
          {estimatedPages} {estimatedPages === 1 ? 'page' : 'pages'} parsed
        </span>
      </div>

      {/* Extracted Core Themes */}
      <div className="space-y-3">
        <p
          className={`text-[13px] ${
            isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
          }`}
        >
          Extracted {extractedThemes.length} core themes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {extractedThemes.map((theme, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2 text-[13px] ${
                isNightMode
                  ? 'bg-[#0B0B0C] text-[#EDEDED]'
                  : 'bg-[#FAFAF7] text-[#1A1A1A]'
              }`}
            >
              <Target className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{theme}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Choose Study Strategy Header & Select All */}
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-medium tracking-[-0.01em]">
          Choose study strategy
        </h3>

        <button
          type="button"
          onClick={onSelectAllFeatures}
          className={`text-[13px] font-medium hover:underline transition-colors duration-150 cursor-pointer ${
            isNightMode ? 'text-[#EDEDED]' : 'text-[#1A1A1A]'
          }`}
        >
          {isAllSelected ? 'Custom selection' : 'Select all'}
        </button>
      </div>

      {/* The 8 Selectable Cards (0px radius on cards, flat surface differentiation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {FEATURE_CONFIGS.map((feat) => {
          const isSelected = selectedFeatures.includes(feat.id) || isAllSelected;

          return (
            <div
              key={feat.id}
              onClick={() => onToggleFeature(feat.id)}
              className={`relative p-3.5 rounded-none transition-colors duration-150 cursor-pointer select-none flex flex-col justify-between min-h-[124px] border ${
                isSelected
                  ? isNightMode
                    ? 'bg-[#1C1C1F] border-[#2D4A3E]'
                    : 'bg-[#E8E6DF] border-[#2D4A3E]'
                  : isNightMode
                  ? 'bg-[#0B0B0C] border-[#EDEDED]/10 hover:bg-[#1C1C1F]/60'
                  : 'bg-[#FAFAF7] border-[#1A1A1A]/10 hover:bg-[#E8E6DF]/60'
              }`}
            >
              {/* Checkbox in top-right */}
              <div
                className={`absolute top-3 right-3 w-4 h-4 rounded-[4px] flex items-center justify-center transition-colors duration-150 ${
                  isSelected
                    ? 'bg-[#2D4A3E] text-[#EDEDED]'
                    : isNightMode
                    ? 'border border-[#EDEDED]/20 bg-[#141416]'
                    : 'border border-[#1A1A1A]/20 bg-[#F2F1EC]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" strokeWidth={2} />}
              </div>

              {/* Icon and Title */}
              <div className="space-y-2 pr-5">
                <div className="flex items-center gap-2">
                  {getFeatureIcon(feat.icon)}
                  {feat.isFlagship && (
                    <span
                      className={`text-[12px] ${
                        isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      · Exam standard
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-[13px] font-medium leading-snug">
                    {feat.name}
                  </h4>
                  <p
                    className={`text-[12px] leading-snug line-clamp-2 mt-1 ${
                      isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                    }`}
                  >
                    {feat.description}
                  </p>
                </div>
              </div>

              {/* Bottom Metadata */}
              <div
                className={`flex items-center justify-between pt-2.5 mt-3 border-t text-[12px] ${
                  isNightMode
                    ? 'border-[#EDEDED]/10 text-[#8A8A8A]'
                    : 'border-[#1A1A1A]/10 text-[#6B6B6B]'
                }`}
              >
                <span>{feat.badge.replace('★ ', '').replace('•', '·')}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {feat.duration}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tweak Options (6px max radius, no pills) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIncludeDistractors((p) => !p)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors duration-150 cursor-pointer border ${
            includeDistractors
              ? 'bg-[#2D4A3E] border-[#2D4A3E] text-[#EDEDED]'
              : isNightMode
              ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#8A8A8A] hover:text-[#EDEDED]'
              : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          {includeDistractors && <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
          <span>Include tricky distractors</span>
        </button>

        <button
          type="button"
          onClick={() => setFocusFormulas((p) => !p)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors duration-150 cursor-pointer border ${
            focusFormulas
              ? 'bg-[#2D4A3E] border-[#2D4A3E] text-[#EDEDED]'
              : isNightMode
              ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#8A8A8A] hover:text-[#EDEDED]'
              : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          {focusFormulas && <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
          <span>Focus on high-yield formulas</span>
        </button>

        <button
          type="button"
          onClick={() => setAddMnemonics((p) => !p)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors duration-150 cursor-pointer border ${
            addMnemonics
              ? 'bg-[#2D4A3E] border-[#2D4A3E] text-[#EDEDED]'
              : isNightMode
              ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#8A8A8A] hover:text-[#EDEDED]'
              : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          {addMnemonics && <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
          <span>Add mnemonic aids</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDatePicker((p) => !p)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-[12px] font-medium transition-colors duration-150 cursor-pointer ${
            isNightMode
              ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#8A8A8A] hover:text-[#EDEDED]'
              : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Exam date: {examDate || 'Set date'}</span>
        </button>
      </div>

      {/* Date Picker Input Box if expanded */}
      {showDatePicker && (
        <div
          className={`p-3 rounded-[6px] border flex items-center gap-3 ${
            isNightMode
              ? 'bg-[#0B0B0C] border-[#EDEDED]/15'
              : 'bg-[#FAFAF7] border-[#1A1A1A]/15'
          }`}
        >
          <span
            className={`text-[13px] ${
              isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
            }`}
          >
            Target exam date:
          </span>
          <input
            type="date"
            value={examDate}
            onChange={(e) => onExamDateChange(e.target.value)}
            className={`border text-[13px] px-2.5 py-1 rounded-[6px] outline-none focus:border-[#2D4A3E] ${
              isNightMode
                ? 'bg-[#141416] border-[#EDEDED]/15 text-[#EDEDED]'
                : 'bg-[#F2F1EC] border-[#1A1A1A]/15 text-[#1A1A1A]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowDatePicker(false)}
            className="text-[13px] font-medium hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* Language Toggle */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t ${
          isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
        }`}
      >
        <span
          className={`text-[13px] ${
            isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
          }`}
        >
          Study material language
        </span>
        <div
          className={`inline-flex rounded-[6px] p-0.5 border ${
            isNightMode
              ? 'bg-[#0B0B0C] border-[#EDEDED]/10'
              : 'bg-[#FAFAF7] border-[#1A1A1A]/10'
          }`}
        >
          <button
            type="button"
            onClick={() => onSelectLanguage('English')}
            className={`px-3 py-1 rounded-[4px] text-[12px] font-medium transition-colors duration-150 cursor-pointer ${
              language === 'English'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            Academic English
          </button>
          <button
            type="button"
            onClick={() => onSelectLanguage('Roman Urdu')}
            className={`px-3 py-1 rounded-[4px] text-[12px] font-medium transition-colors duration-150 cursor-pointer ${
              language === 'Roman Urdu'
                ? 'bg-[#2D4A3E] text-[#EDEDED]'
                : isNightMode
                ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            Roman Urdu
          </button>
        </div>
      </div>

      {/* Primary Submit Button */}
      <button
        type="button"
        disabled={selectedCount === 0 || isGenerating}
        onClick={onGenerate}
        className={`w-full h-11 rounded-[6px] font-medium text-[14px] flex items-center justify-center gap-2 transition-colors duration-150 ${
          selectedCount > 0 && !isGenerating
            ? 'bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] cursor-pointer'
            : isNightMode
            ? 'bg-[#1C1C1F] text-[#8A8A8A]/50 cursor-not-allowed'
            : 'bg-[#E8E6DF] text-[#6B6B6B]/50 cursor-not-allowed'
        }`}
      >
        <span>
          {isGenerating
            ? 'Generating study pack…'
            : `Create study pack (${selectedCount} selected)`}
        </span>
      </button>
    </div>
  );
};
