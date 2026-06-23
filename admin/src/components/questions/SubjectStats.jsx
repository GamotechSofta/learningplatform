export default function SubjectStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Total Questions</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          {stats.total || 0}
        </p>
      </div>
      {(stats.bySubject || []).slice(0, 3).map((item) => (
        <div
          key={item.subject}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.subject}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {item.count}
          </p>
        </div>
      ))}
    </div>
  );
}
