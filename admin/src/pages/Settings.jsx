import PageShell from "../components/PageShell";

export default function Settings() {
  return (
    <PageShell title="Settings" breadcrumbs={["Dashboard", "Settings"]}>
      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Platform Name</label>
            <input type="text" defaultValue="Learning Platform" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Support Email</label>
            <input type="email" defaultValue="support@learning.com" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Default Currency</label>
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
          <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
            Save Settings
          </button>
        </form>
      </div>
    </PageShell>
  );
}
