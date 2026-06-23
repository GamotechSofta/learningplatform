export default function TestSettingsForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Create Test",
  availableQuestionCount = 0,
}) {
  const updateNegative = (enabled) => {
    onChange({
      negativeMarking: { ...form.negativeMarking, enabled },
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        required
        placeholder="Test Name"
        value={form.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-600 dark:text-slate-300">
          Duration (minutes)
          <input
            type="number"
            min={1}
            required
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
            required
            value={form.totalMarks}
            onChange={(e) => onChange({ totalMarks: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
        <label className="text-sm text-slate-600 dark:text-slate-300 sm:col-span-2">
          Number of Questions to Show
          <input
            type="number"
            min={1}
            max={availableQuestionCount || undefined}
            required
            value={form.questionCount}
            onChange={(e) => onChange({ questionCount: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <span className="mt-1 block text-xs text-slate-500">
            {availableQuestionCount > 0
              ? `${availableQuestionCount} question(s) available in this course (auto-picked from Question Management)`
              : "No questions in this course yet — add questions first"}
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
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
            onChange={(e) => updateNegative(e.target.checked)}
          />
          Negative Marking
        </label>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={availableQuestionCount < 1}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
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
