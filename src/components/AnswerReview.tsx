import type { Question } from "../../data/questions";
import type { ChoiceKey } from "@/lib/exam";

type AnswerReviewProps = {
  questions: Question[];
  answers: Record<number, ChoiceKey>;
};

export function AnswerReview({ questions, answers }: AnswerReviewProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-950">Answer Review</h2>
      {questions.map((question, index) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;

        return (
          <article
            key={question.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold leading-7 text-slate-950">
                {index + 1}. {question.questionText}
              </h3>
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
            <dl className="mt-3 grid gap-2 text-sm text-slate-700">
              <div>
                <dt className="font-semibold text-slate-950">Your answer</dt>
                <dd>
                  {userAnswer
                    ? `${userAnswer}. ${question.choices[userAnswer]}`
                    : "Not answered"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Correct answer</dt>
                <dd>
                  {question.correctAnswer}.{" "}
                  {question.choices[question.correctAnswer]}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Explanation</dt>
                <dd>{question.explanationEn}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">
                  Nepali explanation
                </dt>
                <dd>{question.explanationNe}</dd>
              </div>
            </dl>
          </article>
        );
      })}
    </section>
  );
}
