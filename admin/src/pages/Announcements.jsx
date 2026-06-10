import PageShell from "../components/PageShell";

const announcements = [
  { title: "New Feature: Course Bundles", date: "Jun 1, 2026", status: "Published" },
  { title: "Scheduled Maintenance", date: "Jun 10, 2026", status: "Draft" },
];

export default function Announcements() {
  return (
    <PageShell
      title="Announcements"
      breadcrumbs={["Dashboard", "Announcements"]}
      action={
        <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
          + New Announcement
        </button>
      }
    >
      <div className="space-y-4">
        {announcements.map((item) => (
          <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.date}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
