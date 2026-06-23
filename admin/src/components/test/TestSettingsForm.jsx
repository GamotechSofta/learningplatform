export default function TestSettingsForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Save Settings",
  questionOptions = [],
}) {
  const updateNegative = (patch) => {
    onChange({
      negativeMarking: { ...form.negativeMarking, ...patch },
    });
  };

  const toggleQuestion = (id) => {
    const questions = form.questions.includes(id)
      ? form.questions.filter((item) => item !== id)
      : [...form.questions, id];
    onChange({ questions });
  };

  const updateTags = (value) => {
    onChange({
      tags: value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
        <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          Basic Info
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            placeholder="Test Name"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
          />
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            placeholder="Chapter"
            value={form.chapter}
            onChange={(e) => onChange({ chapter: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <textarea
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
          />
          <input
            placeholder="Tags (comma separated)"
            value={form.tags.join(", ")}
            onChange={(e) => updateTags(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
        <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          Test Settings
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Duration (minutes)
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => onChange({ durationMinutes: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Total Marks
            <input
              type="number"
              min={1}
              value={form.totalMarks}
              onChange={(e) => onChange({ totalMarks: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Max Attempts
            <input
              type="number"
              min={1}
              value={form.maxAttempts}
              onChange={(e) => onChange({ maxAttempts: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Status
            <select
              value={form.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Start Date
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-300">
            End Date
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.shuffleQuestions}
              onChange={(e) => onChange({ shuffleQuestions: e.target.checked })}
            />
            Question Shuffle
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.shuffleOptions}
              onChange={(e) => onChange({ shuffleOptions: e.target.checked })}
            />
            Option Shuffle
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.negativeMarking.enabled}
              onChange={(e) => updateNegative({ enabled: e.target.checked })}
            />
            Negative Marking
          </label>
          {form.negativeMarking.enabled && (
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Marks per wrong answer
              <input
                type="number"
                min={0}
                step={0.25}
                value={form.negativeMarking.perQuestion}
                onChange={(e) =>
                  updateNegative({ perQuestion: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) => onChange({ isPaid: e.target.checked })}
            />
            Paid Test
          </label>
          {form.isPaid && (
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Price (₹)
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => onChange({ price: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          )}
        </div>
      </section>

      {questionOptions.length > 0 && (
        <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Assign Questions ({form.questions.length} selected)
          </h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {questionOptions.map((question) => (
              <label
                key={question._id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
              >
                <input
                  type="checkbox"
                  checked={form.questions.includes(question._id)}
                  onChange={() => toggleQuestion(question._id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">
                    #{question.questionNumber} · {question.subject}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-slate-500">
                    {question.question}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
