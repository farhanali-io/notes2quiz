import React, { useState } from 'react';
import { RevisionDay } from '../types/studyPack';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

interface RevisionPlanProps {
  examDate?: string;
  totalDays: number;
  days: RevisionDay[];
}

export const RevisionPlan: React.FC<RevisionPlanProps> = ({
  examDate = '2026-06-15',
  totalDays,
  days,
}) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-[8px] bg-[#1F1F1F]/70 border border-[#262626]">
        <div className="flex items-center gap-2 text-[13px] text-[#FCFCFC]">
          <Calendar className="w-4 h-4 text-[#14AC8C]" />
          <span>Target Exam: <strong className="font-semibold text-[#14AC8C]">{examDate}</strong></span>
        </div>
        <span className="text-[12px] text-[#A1A1A1]">
          {totalDays} Day Structured Roadmap
        </span>
      </div>

      {/* Vertical timeline */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#262626]">
        {days.map((day) => (
          <div key={day.dayNumber} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#141414] border-2 border-[#14AC8C] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#14AC8C]" />
            </div>

            <div className="rounded-[10px] bg-[#1F1F1F]/40 border border-[#262626] p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#14AC8C] uppercase tracking-wider">
                    {day.dateStr}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#14AC8C]/15 text-[#14AC8C] font-medium border border-[#14AC8C]/20">
                    {day.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#A1A1A1]">
                  <Clock className="w-3 h-3" />
                  <span>{day.duration}</span>
                </div>
              </div>

              <h4 className="text-[14px] font-semibold text-[#FCFCFC]">
                {day.topic}
              </h4>

              <ul className="space-y-1.5 pt-1">
                {day.tasks.map((task, tIdx) => {
                  const key = `${day.dayNumber}-${tIdx}`;
                  const isDone = !!completedTasks[key];
                  return (
                    <li
                      key={tIdx}
                      onClick={() => toggleTask(key)}
                      className="flex items-start gap-2 text-[12px] sm:text-[13px] text-[#A1A1A1] hover:text-[#FCFCFC] cursor-pointer transition-colors"
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0"
                        aria-label={isDone ? 'Mark task incomplete' : 'Mark task complete'}
                      >
                        <CheckCircle
                          className={`w-3.5 h-3.5 transition-colors ${
                            isDone ? 'text-[#14AC8C]' : 'text-[#3D3D3D]'
                          }`}
                        />
                      </button>
                      <span className={isDone ? 'line-through text-[#666666]' : ''}>
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
