const statusClass = {
  answered: "bg-green-500 text-white",
  review: "bg-amber-500 text-white",
  current: "ring-2 ring-blue-500 bg-blue-600 text-white",
  default: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export default function QuestionPalette({ questions, currentIndex, answers, onJump }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-3 text-sm font-medium text-slate-800 dark:text-slate-100">
        Question Palette
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {questions.map((question, index) => {
          const answer = answers[question._id] || {};
          let status = "default";
          if (index === currentIndex) status = "current";
          else if (answer.markedForReview) status = "review";
          else if (answer.selectedAnswer) status = "answered";

          return (
            <button
              key={question._id}
              type="button"
              onClick={() => onJump(index)}
              className={`h-9 rounded-lg text-sm font-medium ${statusClass[status]}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-green-500" /> Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-500" /> Review
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded ring-2 ring-blue-500 bg-blue-600" /> Current
        </span>
      </div>
    </div>
  );
}
