import React, { useState, useEffect } from 'react';
import { Clock, X, RotateCcw, Award } from 'lucide-react';
import { MCQItem } from '../types/studyPack';

interface TimedQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: MCQItem[];
  title?: string;
  durationMinutes?: number;
  isNightMode?: boolean;
}

export const TimedQuizModal: React.FC<TimedQuizModalProps> = ({
  isOpen,
  onClose,
  questions,
  title = 'BIO 301 Midterm Examination',
  durationMinutes = 15,
  isNightMode = true,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    setSecondsLeft(durationMinutes * 60);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, durationMinutes, isSubmitted]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex] || questions[0];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  };

  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0B0C]/80 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl border rounded-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex flex-col max-h-[90vh] overflow-hidden ${
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
          <div>
            <h3 className="font-medium text-[15px] tracking-[-0.01em]">{title}</h3>
            <p
              className={`text-[12px] ${
                isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
              }`}
            >
              Timed exam simulation
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-medium border ${
                  isNightMode
                    ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#EDEDED]'
                    : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#1A1A1A]'
                }`}
              >
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                <span>{timeFormatted}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className={`p-1 rounded-[6px] transition-colors duration-150 cursor-pointer ${
                isNightMode
                  ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                  : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!isSubmitted ? (
            <>
              <div
                className={`flex items-center justify-between text-[12px] ${
                  isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                }`}
              >
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span>{Object.keys(answers).length} answered</span>
              </div>

              <div
                className={`p-4 rounded-none space-y-3 ${
                  isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
                }`}
              >
                <p className="text-[15px] font-medium leading-[1.6]">
                  {currentQ.question}
                </p>

                <div className="space-y-2 pt-1">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = answers[currentIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }))
                        }
                        className={`w-full text-left p-3 rounded-[6px] border text-[14px] flex items-center gap-3 transition-colors duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-[#2D4A3E] border-[#2D4A3E] text-[#EDEDED]'
                            : isNightMode
                            ? 'bg-[#141416] border-[#EDEDED]/10 text-[#EDEDED] hover:bg-[#1C1C1F]'
                            : 'bg-[#F2F1EC] border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#E8E6DF]'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-[4px] flex items-center justify-center text-[12px] font-medium shrink-0 ${
                            isSelected
                              ? 'bg-[#0B0B0C]/30 text-[#EDEDED]'
                              : isNightMode
                              ? 'bg-[#1C1C1F] text-[#8A8A8A]'
                              : 'bg-[#E8E6DF] text-[#6B6B6B]'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Grid */}
              <div className="pt-1">
                <span
                  className={`text-[12px] block mb-2 ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  Jump to question
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded-[6px] text-[12px] font-medium transition-colors duration-150 cursor-pointer border ${
                        idx === currentIndex
                          ? 'bg-[#2D4A3E] border-[#2D4A3E] text-[#EDEDED]'
                          : answers[idx] !== undefined
                          ? isNightMode
                            ? 'bg-[#1C1C1F] border-[#2D4A3E] text-[#EDEDED]'
                            : 'bg-[#E8E6DF] border-[#2D4A3E] text-[#1A1A1A]'
                          : isNightMode
                          ? 'bg-[#0B0B0C] border-[#EDEDED]/10 text-[#8A8A8A] hover:text-[#EDEDED]'
                          : 'bg-[#FAFAF7] border-[#1A1A1A]/10 text-[#6B6B6B] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-5">
              <div className="flex justify-center">
                <Award className="w-8 h-8" strokeWidth={1.5} />
              </div>

              <div>
                <h4 className="text-[18px] font-medium tracking-[-0.01em]">
                  Quiz completed
                </h4>
                <p
                  className={`text-[13px] mt-1 ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  Academic performance summary
                </p>
              </div>

              <div
                className={`p-5 rounded-none max-w-sm mx-auto space-y-2 ${
                  isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
                }`}
              >
                <div className="text-[32px] font-semibold tracking-[-0.01em]">
                  {score.percentage}%
                </div>
                <div className="text-[14px]">
                  {score.correct} correct out of {score.total} questions
                </div>
                <p
                  className={`text-[13px] ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  {score.percentage >= 75
                    ? 'Strong mastery across tested concepts.'
                    : 'Review the missed concepts and try again.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setAnswers({});
                  setSecondsLeft(durationMinutes * 60);
                  setCurrentIndex(0);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-[13px] font-medium transition-colors duration-150 cursor-pointer border ${
                  isNightMode
                    ? 'bg-[#0B0B0C] border-[#EDEDED]/15 text-[#EDEDED] hover:bg-[#1C1C1F]'
                    : 'bg-[#FAFAF7] border-[#1A1A1A]/15 text-[#1A1A1A] hover:bg-[#E8E6DF]'
                }`}
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                <span>Retry timed exam</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between ${
            isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
          }`}
        >
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 disabled:opacity-40 cursor-pointer ${
                  isNightMode
                    ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F]'
                    : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF]'
                }`}
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitted(true)}
                className="px-4 py-1.5 rounded-[6px] bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] text-[13px] font-medium transition-colors duration-150 cursor-pointer"
              >
                Submit exam
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                disabled={currentIndex === questions.length - 1}
                className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors duration-150 disabled:opacity-40 cursor-pointer ${
                  isNightMode
                    ? 'bg-[#0B0B0C] text-[#EDEDED] hover:bg-[#1C1C1F]'
                    : 'bg-[#FAFAF7] text-[#1A1A1A] hover:bg-[#E8E6DF]'
                }`}
              >
                Next
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-[6px] bg-[#2D4A3E] hover:bg-[#375A4B] text-[#EDEDED] text-[13px] font-medium transition-colors duration-150 cursor-pointer"
            >
              Close results
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
