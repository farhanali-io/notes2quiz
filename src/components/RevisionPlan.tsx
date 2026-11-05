import React, { useState } from 'react';
import { RevisionDay } from '../types/studyPack';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

interface RevisionPlanProps {
  examDate?: string;
  totalDays: number;
  days: RevisionDay[];
  isNightMode?: boolean;
}

export const RevisionPlan: React.FC<RevisionPlanProps> = ({
  examDate = '2026-06-15',
  totalDays,
  days,
  isNightMode = true,
}) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`flex flex-wrap items-center justify-between gap-2 pb-3 border-b text-[13px] ${
          isNightMode ? 'border-[#EDEDED]/10' : 'border-[#1A1A1A]/10'
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span>Target exam: {examDate}</span>
        </div>
        <span className={isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'}>
          {totalDays} day roadmap
        </span>
      </div>

      {/* Vertical timeline */}
      <div
        className={`relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] ${
          isNightMode ? 'before:bg-[#EDEDED]/15' : 'before:bg-[#1A1A1A]/15'
        }`}
      >
        {days.map((day) => (
          <div key={day.dayNumber} className="relative">
            {/* Timeline node */}
            <div
              className={`absolute -left-5 top-1.5 w-3 h-3 rounded-[2px] border border-[#2D4A3E] ${
                isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
              }`}
            />

            <div
              className={`w-full rounded-none p-3.5 sm:p-4 space-y-2.5 ${
                isNightMode ? 'bg-[#0B0B0C]' : 'bg-[#FAFAF7]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <div
                  className={`flex items-center gap-2 ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  <span className="font-medium">{day.dateStr}</span>
                  <span>·</span>
                  <span>{day.badge}</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    isNightMode ? 'text-[#8A8A8A]' : 'text-[#6B6B6B]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span>{day.duration}</span>
                </div>
              </div>

              <h4 className="text-[14px] font-medium break-words">{day.topic}</h4>

              <ul className="space-y-1.5 pt-1">
                {day.tasks.map((task, tIdx) => {
                  const key = `${day.dayNumber}-${tIdx}`;
                  const isDone = !!completedTasks[key];
                  return (
                    <li
                      key={tIdx}
                      onClick={() => toggleTask(key)}
                      className={`flex items-start gap-2 text-[13px] cursor-pointer transition-colors duration-150 ${
                        isNightMode
                          ? 'text-[#8A8A8A] hover:text-[#EDEDED]'
                          : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 cursor-pointer"
                        aria-label={isDone ? 'Mark task incomplete' : 'Mark task complete'}
                      >
                        <CheckCircle
                          className={`w-4 h-4 transition-colors duration-150 ${
                            isDone
                              ? 'text-[#2D4A3E]'
                              : isNightMode
                              ? 'text-[#8A8A8A]/40'
                              : 'text-[#6B6B6B]/40'
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                      <span className={`break-words ${isDone ? 'line-through opacity-60' : ''}`}>
                        {task}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
