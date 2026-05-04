import type { Question } from "../../data/questions";
import { sectionLabels, type ChoiceKey } from "@/lib/exam";

type AnswerReviewProps = {
  questions: Question[];
  answers: Record<number, ChoiceKey>;
};

export function AnswerReview({ questions, answers }: AnswerReviewProps) {
  return (
    <section id="answer-review" className="scroll-mt-20 space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          Review My Answers
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Check each answer and read the explanation before you retake.
        </p>
      </div>
      {questions.map((question, index) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;

        return (
          <article
            key={question.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-3 sm:flex sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Question {index + 1} - {sectionLabels[question.section]}
                </p>
                <h3 className="mt-1 font-semibold leading-7 text-slate-950">
                  {question.questionText}
                </h3>
              </div>
              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  isCorrect
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm text-slate-700">
              <div className="rounded-md bg-slate-50 p-3">
                <dt className="font-semibold text-slate-950">Your answer</dt>
                <dd>
                  {userAnswer
                    ? `${userAnswer}. ${question.choices[userAnswer]}`
                    : "Not answered"}
                </dd>
              </div>
              <div className="rounded-md bg-emerald-50 p-3">
                <dt className="font-semibold text-slate-950">Correct answer</dt>
                <dd>
                  {question.correctAnswer}.{" "}
                  {question.choices[question.correctAnswer]}
                </dd>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <dt className="font-semibold text-slate-950">Explanation</dt>
                <dd className="mt-1 leading-6">{question.explanationEn}</dd>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <dt className="font-semibold text-slate-950">
                  Nepali explanation
                </dt>
                <dd className="mt-1 leading-6">
                  {question.explanationNe || "Nepali explanation coming soon."}
                </dd>
              </div>
            </dl>
          </article>
        );
      })}
    </section>
  );
}
