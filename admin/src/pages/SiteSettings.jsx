import PageShell from "../components/PageShell";

export default function SiteSettings() {
  return (
    <PageShell title="Site Settings" breadcrumbs={["Dashboard", "Site Settings"]}>
      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Branding</h3>
          <form className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Site Logo</label>
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-500">
                Upload logo
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Favicon</label>
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-500">
                Upload favicon
              </div>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">SEO</h3>
          <form className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Meta Title</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Meta Description</label>
              <textarea rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
