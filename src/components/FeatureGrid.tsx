import React from 'react';
import {
  Layers,
  FileText,
  ListChecks,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Calendar,
  EyeOff,
  Check,
} from 'lucide-react';
import { FEATURE_CONFIGS } from '../types/studyPack';

interface FeatureGridProps {
  selectedFeatures: string[];
  onToggleFeature: (id: string) => void;
  onSelectAll: () => void;
  onGenerate: () => void;
  disabled?: boolean;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  selectedFeatures,
  onToggleFeature,
  onSelectAll,
  onGenerate,
  disabled = false,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'ListChecks':
        return <ListChecks className="w-4 h-4" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4" />;
      case 'EyeOff':
        return <EyeOff className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const isAllSelected = selectedFeatures.includes('full_package');
  const count = isAllSelected ? 8 : selectedFeatures.length;

  return (
    <div className="w-full space-y-3.5 my-2">
      {/* Quick selection toolbar */}
      <div className="flex items-center justify-between text-[11px] text-[#A1A1A1] px-1">
        <span>Select study materials ({count} selected)</span>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-[#14AC8C] hover:underline font-semibold uppercase tracking-wider"
        >
          {isAllSelected ? 'Deselect All' : 'Select All (Full Pack)'}
        </button>
      </div>

      {/* Grid of 8 selectable cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {FEATURE_CONFIGS.map((feat) => {
          const isSelected = selectedFeatures.includes(feat.id) || isAllSelected;

          return (
            <button
              key={feat.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggleFeature(feat.id)}
              className={`relative text-left p-3 rounded-[12px] transition-all duration-200 select-none flex flex-col justify-between min-h-[96px] ${
                isSelected
                  ? 'bg-[#141414] border-2 border-[#14AC8C] shadow-[0_0_15px_-4px_rgba(20,172,140,0.3)]'
                  : 'bg-[#141414] border border-[#1F1F1F] hover:border-[#2D2D2D]'
              } ${feat.isFlagship && !isSelected ? 'ring-1 ring-[#14AC8C]/30 bg-[#161b19]' : ''}`}
            >
              {/* Flagship Badge */}
              {feat.isFlagship && (
                <span className="absolute -top-2 left-2 text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-[#14AC8C] text-[#111111] shadow-sm">
                  ★ Best for exams
                </span>
              )}

              {/* Checkmark indicator badge in corner */}
              {isSelected && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#14AC8C] text-[#111111] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}

              <div className="space-y-1">
                <div
                  className={`w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#14AC8C]/20 text-[#14AC8C]'
                      : 'bg-[#1F1F1F] text-[#A1A1A1]'
                  }`}
                >
                  {getIcon(feat.icon)}
                </div>

                <h4 className="text-[13px] sm:text-[14px] font-bold text-[#FCFCFC] leading-snug pt-1">
                  {feat.name}
                </h4>
              </div>

              <p className="text-[11px] text-[#A1A1A1] leading-tight line-clamp-2 mt-1">
                {feat.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Full-width primary Generate button */}
      <button
        type="button"
        disabled={disabled || selectedFeatures.length === 0}
        onClick={onGenerate}
        className={`w-full h-12 rounded-[12px] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
          selectedFeatures.length > 0 && !disabled
            ? 'bg-[#14AC8C] text-[#111111] hover:bg-[#129a7d] active:scale-[0.99] shadow-[0_4px_20px_-4px_rgba(20,172,140,0.4)]'
            : 'bg-[#1F1F1F] text-[#666666] cursor-not-allowed border border-[#262626]'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>Generate Study Pack ({selectedFeatures.length} selected)</span>
      </button>
    </div>
  );
};
