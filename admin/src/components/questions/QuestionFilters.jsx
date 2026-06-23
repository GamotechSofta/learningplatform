export default function QuestionFilters({
  filters,
  onChange,
  onSubmit,
  subjects = [],
  shifts = [],
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5"
    >
      <input
        type="search"
        placeholder="Search keyword..."
        value={filters.q}
        onChange={(e) => onChange({ q: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
      <select
        value={filters.subject}
        onChange={(e) => onChange({ subject: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">All subjects</option>
        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
      <select
        value={filters.shift}
        onChange={(e) => onChange({ shift: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">All shifts</option>
        {shifts.map((shift) => (
          <option key={shift} value={shift}>
            {shift}
          </option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        placeholder="Question #"
        value={filters.questionNumber}
        onChange={(e) => onChange({ questionNumber: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
      >
        Apply Filters
      </button>
    </form>
  );
}
