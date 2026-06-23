export default function QuestionFilters({
  filters,
  onChange,
  onSubmit,
  subjects = [],
  chapters = [],
  years = [],
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8"
    >
      <input
        type="search"
        placeholder="Search question..."
        value={filters.q}
        onChange={(e) => onChange({ q: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 2xl:col-span-2"
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
        value={filters.chapter}
        onChange={(e) => onChange({ chapter: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">All chapters</option>
        {chapters.map((chapter) => (
          <option key={chapter} value={chapter}>
            {chapter}
          </option>
        ))}
      </select>
      <select
        value={filters.difficulty}
        onChange={(e) => onChange({ difficulty: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">All difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <select
        value={filters.year}
        onChange={(e) => onChange({ year: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">All years</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <select
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="latest">Latest first</option>
        <option value="oldest">Oldest first</option>
      </select>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
      >
        Apply
      </button>
    </form>
  );
}
