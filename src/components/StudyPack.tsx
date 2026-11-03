import React from 'react';
import { Card } from './Card';
import { MCQCard } from './MCQCard';
import { Flashcard } from './Flashcard';
import { RevisionPlan } from './RevisionPlan';
import { ActiveRecall } from './ActiveRecall';
import { StudyPackData } from '../data/mockPacks';
import { Sparkles, BookOpen, FileQuestion, Clock, Lightbulb } from 'lucide-react';

interface StudyPackProps {
  data: StudyPackData;
  selectedFeatures: string[];
  examDate?: string;
}

export const StudyPack: React.FC<StudyPackProps> = ({
  data,
  selectedFeatures,
  examDate,
}) => {
  // If 'full_package' is in selectedFeatures, include all individual modules
  const isFull = selectedFeatures.includes('full_package');
  const shouldRender = (id: string) => isFull || selectedFeatures.includes(id);

  return (
    <div className="space-y-4 w-full">
      {/* 1. Full Study Package Banner if full_package selected */}
      {isFull && (
        <div className="p-3.5 rounded-[12px] bg-gradient-to-r from-[#14AC8C]/15 to-[#344CE4]/15 border border-[#14AC8C]/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#14AC8C] text-[#111111] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-[#FCFCFC]">
              Complete All-in-One Study Package Generated
            </h4>
            <p className="text-[12px] text-[#A1A1A1]">
              Includes simplified concepts, key points, MCQs, flashcards, exam notes, and revision roadmap.
            </p>
          </div>
        </div>
      )}

      {/* 2. Simplified Notes */}
      {shouldRender('simplified_notes') && (
        <Card
          title="Simplified Notes"
          badge="High Clarity"
          copyContent={data.simplifiedNotes.sections
            .map((s) => `${s.heading}\n${s.content}`)
            .join('\n\n')}
        >
          <div className="space-y-4">
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#FCFCFC]">
              {data.simplifiedNotes.title}
            </h3>
            {data.simplifiedNotes.sections.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="text-[13px] font-semibold text-[#14AC8C]">
                  {sec.heading}
                </h4>
                <p className="text-[14px] text-[#FCFCFC]/90 leading-relaxed whitespace-pre-line">
                  {sec.content.split('**').map((chunk, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="text-[#FCFCFC] font-semibold">
                        {chunk}
                      </strong>
                    ) : (
                      chunk
                    )
                  )}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. Key Points */}
      {shouldRender('key_points') && (
        <Card
          title="Key Points"
          badge="High Yield"
          copyContent={`${data.keyPoints.summary}\n` + data.keyPoints.points.map((p) => `• ${p}`).join('\n')}
        >
          <p className="text-[13px] text-[#A1A1A1] italic mb-2">
            {data.keyPoints.summary}
          </p>
          <ul className="space-y-2.5">
            {data.keyPoints.points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#FCFCFC]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14AC8C] mt-2 shrink-0" />
                <span>
                  {pt.split('**').map((chunk, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="text-[#14AC8C] font-semibold">
                        {chunk}
                      </strong>
                    ) : (
                      chunk
                    )
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 4. MCQs */}
      {shouldRender('mcqs') && (
        <Card
          title="Interactive MCQs"
          badge="Self-Testing"
          copyContent={data.mcqs
            .map(
              (m, i) =>
                `Q${i + 1}: ${m.question}\n` +
                m.options.map((o, oi) => `  ${String.fromCharCode(65 + oi)}. ${o}`).join('\n') +
                `\nCorrect: ${String.fromCharCode(65 + m.correctIndex)} - ${m.explanation}\n`
            )
            .join('\n')}
        >
          <MCQCard items={data.mcqs} />
        </Card>
      )}

      {/* 5. Flashcards */}
      {shouldRender('flashcards') && (
        <Card
          title="Flashcards"
          badge="Spaced Repetition"
          copyContent={data.flashcards
            .map((f, i) => `Card ${i + 1} (${f.keyTerm}):\nQ: ${f.front}\nA: ${f.back}\n`)
            .join('\n')}
        >
          <Flashcard cards={data.flashcards} />
        </Card>
      )}

      {/* 6. Exam Notes (★ Flagship feature: Short + Long questions + MCQs) */}
      {shouldRender('exam_notes') && (
        <Card
          title="Exam Notes"
          badge="★ Best for exams"
          className="ring-1 ring-[#14AC8C]/40 shadow-[0_0_20px_-8px_rgba(20,172,140,0.25)]"
          copyContent={
            `=== EXAM NOTES ===\n` +
            `\n-- SHORT QUESTIONS --\n` +
            data.examNotes.shortQuestions.map((sq) => `${sq.question} (${sq.marks} marks)\nAns: ${sq.answer}`).join('\n\n') +
            `\n\n-- LONG QUESTIONS --\n` +
            data.examNotes.longQuestions
              .map((lq) => `${lq.question} (${lq.marks} marks)\nOutline:\n` + lq.outline.map((o) => `• ${o}`).join('\n'))
              .join('\n\n') +
            `\n\n-- RAPID MCQs --\n` +
            data.examNotes.mcqs.map((m) => `${m.question}\nAns: ${m.options[m.correctIndex]}`).join('\n')
          }
        >
          <div className="space-y-6">
            {/* Sub-section A: Short Questions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#222222]">
                <FileQuestion className="w-4 h-4 text-[#14AC8C]" />
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#FCFCFC]">
                  Part 1: Short Questions (2–3 Marks)
                </h4>
              </div>

              <div className="space-y-3">
                {data.examNotes.shortQuestions.map((sq, i) => (
                  <div key={i} className="p-3 rounded-[8px] bg-[#1F1F1F]/50 border border-[#262626] space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] sm:text-[14px] font-semibold text-[#FCFCFC]">
                        {sq.question}
                      </p>
                      <span className="text-[11px] font-mono text-[#14AC8C] shrink-0 px-1.5 py-0.5 rounded bg-[#14AC8C]/15">
                        {sq.marks}M
                      </span>
                    </div>
                    <p className="text-[13px] text-[#A1A1A1] leading-relaxed">
                      <strong className="text-[#14AC8C]">Model Answer: </strong>
                      {sq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-section B: Long Questions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#222222]">
                <BookOpen className="w-4 h-4 text-[#344CE4]" />
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#FCFCFC]">
                  Part 2: Long Questions (7 Marks)
                </h4>
              </div>

              <div className="space-y-3">
                {data.examNotes.longQuestions.map((lq, i) => (
                  <div key={i} className="p-3.5 rounded-[8px] bg-[#1F1F1F]/50 border border-[#262626] space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-[14px] font-semibold text-[#FCFCFC]">
                        {lq.question}
                      </h5>
                      <span className="text-[11px] font-mono text-[#344CE4] shrink-0 px-1.5 py-0.5 rounded bg-[#344CE4]/15">
                        {lq.marks}M
                      </span>
                    </div>
                    <div className="text-[12px] text-[#A1A1A1] space-y-1 bg-[#141414] p-2.5 rounded-[6px] border border-[#222222]">
                      <span className="font-semibold text-[#FCFCFC] block mb-1">
                        High-Scoring Answer Structure:
                      </span>
                      {lq.outline.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-[#344CE4] font-bold">•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-section C: MCQs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#222222]">
                <Lightbulb className="w-4 h-4 text-[#FFD166]" />
                <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#FCFCFC]">
                  Part 3: Past Paper MCQs
                </h4>
              </div>
              <MCQCard items={data.examNotes.mcqs} />
            </div>
          </div>
        </Card>
      )}

      {/* 7. Personal Revision Plan */}
      {shouldRender('revision_plan') && (
        <Card
          title="Personal Revision Plan"
          badge="Exam Countdown"
          copyContent={
            `Target Exam: ${examDate || data.revisionPlan.examDate}\n` +
            data.revisionPlan.days
              .map((d) => `${d.dateStr}: ${d.topic} (${d.duration})\n` + d.tasks.map((t) => ` - ${t}`).join('\n'))
              .join('\n\n')
          }
        >
          <RevisionPlan
            examDate={examDate || data.revisionPlan.examDate}
            totalDays={data.revisionPlan.totalDays}
            days={data.revisionPlan.days}
          />
        </Card>
      )}

      {/* 8. Active Recall Mode */}
      {shouldRender('active_recall') && (
        <Card
          title="Active Recall Mode"
          badge="High Retention"
          copyContent={data.activeRecall
            .map((ar, i) => `Q${i + 1} (${ar.concept}): ${ar.question}\nAnswer: ${ar.answer}`)
            .join('\n\n')}
        >
          <ActiveRecall items={data.activeRecall} />
        </Card>
      )}
    </div>
  );
};
