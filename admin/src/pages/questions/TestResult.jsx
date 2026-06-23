import { Link, useLocation, Navigate } from "react-router-dom";
import PageShell from "../../components/PageShell";
import MathText from "../../components/questions/MathText";

export default function TestResult() {
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return <Navigate to="/questions/test" replace />;
  }

  return (
    <PageShell
      description="Instant score and answer review for your submitted test."
      action={
        <div className="flex gap-2">
          <Link
            to="/questions/test"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Retake Test
          </Link>
          <Link
            to="/questions"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
          >
            Dashboard
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Score", `${result.score}%`],
          ["Correct", result.correct],
          ["Incorrect", result.incorrect],
          ["Unattempted", result.unattempted],
          ["Review Marked", result.markedForReview],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {result.answers?.map((item, index) => (
          <div
            key={`${item.question}-${index}`}
            className={`rounded-xl border p-5 ${
              item.isCorrect
                ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950"
                : item.selectedAnswer
                  ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>Q{item.questionNumber}</span>
              <span>{item.subject}</span>
              {item.markedForReview && <span>Marked for review</span>}
            </div>
            <MathText className="mt-2 text-sm">
              {item.questionText}
            </MathText>
            <p className="mt-3 text-sm">
              Your answer: <strong>{item.selectedAnswer || "Not attempted"}</strong>
            </p>
            <p className="text-sm">
              Correct answer: <strong>{item.correctAnswer}</strong>
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
