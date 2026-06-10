import PageShell from "../components/PageShell";

export default function Reports() {
  return (
    <PageShell title="Reports" breadcrumbs={["Dashboard", "Reports"]}>
      <div className="grid gap-4 sm:grid-cols-2">
        {["Sales Report", "Enrollment Report", "Revenue Report", "Instructor Report"].map((report) => (
          <div key={report} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{report}</h3>
            <p className="mt-1 text-sm text-slate-500">Download or view detailed analytics</p>
            <button type="button" className="mt-4 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              Generate
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
