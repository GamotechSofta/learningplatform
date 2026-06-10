import PageShell from "../components/PageShell";

export default function Coupons() {
  return (
    <PageShell
      action={
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2 text-sm font-medium text-white"
        >
          + Create Coupon
        </button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Expires</th>
              <th className="px-5 py-3 font-medium">Uses</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                No coupons yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
