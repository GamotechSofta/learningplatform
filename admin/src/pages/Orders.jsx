import PageShell from "../components/PageShell";

export default function Orders() {
  return (
    <PageShell>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Order ID</th>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Course</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                No orders yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
