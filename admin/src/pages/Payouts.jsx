import PageShell from "../components/PageShell";

export default function Payouts() {
  return (
    <PageShell>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Instructor</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                No payouts yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
