import { getChoiceByKey, getCorrectChoiceKey } from "../../data/questions";
import type { Question } from "../../data/questions";
import { sectionLabels, type ChoiceKey } from "@/lib/exam";

type AnswerReviewProps = {
  questions: Question[];
  answers: Record<string, ChoiceKey>;
};

export function AnswerReview({ questions, answers }: AnswerReviewProps) {
  return (
    <section id="answer-review" className="scroll-mt-20 space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          Answer Review
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Check each answer and read the explanation before you retake.
        </p>
      </div>
      {questions.map((question, index) => {
        const userAnswer = answers[question.id];
        const correctAnswerKey = getCorrectChoiceKey(question);
        const isCorrect = getChoiceByKey(question, userAnswer) === question.answer;

        return (
          <article
            key={question.id}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-3 sm:flex sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Question {index + 1} - {sectionLabels[question.section]}
                </p>
                <h3 className="mt-1 font-semibold leading-7 text-slate-950">
                  {question.question}
                </h3>
              </div>
              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  isCorrect
                    ? "bg-[#1e5fdc]/10 text-[#1e5fdc]"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-3">
                <dt className="font-semibold text-slate-950">Your answer</dt>
                <dd>
                  {userAnswer
                    ? `${userAnswer}. ${getChoiceByKey(question, userAnswer)}`
                    : "Not answered"}
                </dd>
              </div>
              <div className="rounded-2xl bg-[#1e5fdc]/10 p-3">
                <dt className="font-semibold text-slate-950">Correct answer</dt>
                <dd>
                  {correctAnswerKey ? `${correctAnswerKey}. ` : ""}
                  {question.answer}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200 p-3">
                <dt className="font-semibold text-slate-950">Explanation</dt>
                <dd className="mt-1 leading-6">{question.explanationEn}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 p-3">
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
