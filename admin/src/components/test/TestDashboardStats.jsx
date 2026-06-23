export default function TestDashboardStats({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: "Total Questions", value: stats.totalQuestions },
    { label: "Total Tests", value: stats.totalTests },
    { label: "Total Students", value: stats.totalStudents },
    { label: "Active Tests", value: stats.activeTests },
    { label: "Test Attempts", value: stats.totalAttempts },
    {
      label: "Revenue (Paid)",
      value: `₹${Number(stats.revenue || 0).toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Subject-wise Statistics
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(stats.bySubject || []).map((item) => (
            <div
              key={item.subject}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {item.subject || "Unknown"}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{item.count}</span>
            </div>
          ))}
          {!stats.bySubject?.length && (
            <p className="text-sm text-slate-500">No subject data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
