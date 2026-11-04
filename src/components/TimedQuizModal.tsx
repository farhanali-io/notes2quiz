import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, X, RotateCcw, Award } from 'lucide-react';
import { MCQItem } from '../types/studyPack';

interface TimedQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: MCQItem[];
  title?: string;
  durationMinutes?: number;
}

export const TimedQuizModal: React.FC<TimedQuizModalProps> = ({
  isOpen,
  onClose,
  questions,
  title = 'BIO 301 Midterm Examination',
  durationMinutes = 15,
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
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0E111C] border border-[#1E253A] rounded-[16px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1A2033] flex items-center justify-between bg-[#121626]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-[15px] text-white tracking-tight">{title}</h3>
              <p className="text-[11px] text-[#A1A1A1]">Timed Exam Simulation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isSubmitted && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-mono font-bold ${
                  secondsLeft < 180
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-[#181E32] text-indigo-300 border border-[#263152]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timeFormatted}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-[#A1A1A1] hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!isSubmitted ? (
            <>
              {/* Question progress */}
              <div className="flex items-center justify-between text-[11px] text-[#A1A1A1]">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{Object.keys(answers).length} answered</span>
              </div>

              {/* Question */}
              <div className="p-4 rounded-[12px] bg-[#141828] border border-[#1E253E] space-y-3">
                <p className="text-[15px] font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </p>

                {/* Options */}
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
                        className={`w-full text-left p-3 rounded-[8px] border text-[13px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                            : 'bg-[#0E121E] border-[#1C2236] text-[#E2E8F0] hover:bg-[#161B2E]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[#181E32] text-[#A1A1A1]'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Grid Buttons */}
              <div className="pt-2">
                <span className="text-[11px] text-[#737A8C] block mb-1.5 font-medium">Jump to question:</span>
                <div className="flex flex-wrap gap-1.5">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded text-[11px] font-mono font-medium transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                          : answers[idx] !== undefined
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#141828] text-[#737A8C] hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Results View */
            <div className="text-center py-6 space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-950/50">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-[20px] font-bold text-white">Quiz Completed!</h4>
                <p className="text-[13px] text-[#A1A1A1]">Here is your academic performance breakdown:</p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#141828] border border-[#1E253E] max-w-sm mx-auto space-y-2">
                <div className="text-[32px] font-black text-emerald-400 font-mono">
                  {score.percentage}%
                </div>
                <div className="text-[13px] text-[#FCFCFC]">
                  {score.correct} Correct out of {score.total} Questions
                </div>
                <p className="text-[11px] text-indigo-300">
                  {score.percentage >= 75
                    ? '🎉 Excellent mastery! You are well-prepared for university exams.'
                    : '💡 High-yield concepts need another revision pass.'}
                </p>
              </div>

              {/* Review questions button */}
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setAnswers({});
                  setSecondsLeft(durationMinutes * 60);
                  setCurrentIndex(0);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#181E32] text-white hover:bg-[#202842] text-[13px] font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>Retry Timed Exam</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1A2033] bg-[#121626] flex items-center justify-between">
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 rounded bg-[#181E32] text-white text-[12px] font-medium disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitted(true)}
                className="px-4 py-1.5 rounded bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[12px] font-semibold hover:opacity-95 cursor-pointer shadow-md"
              >
                Submit Exam Now
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-3 py-1.5 rounded bg-[#181E32] text-white text-[12px] font-medium disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-500 cursor-pointer"
            >
              Close Exam Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
