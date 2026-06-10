import PageShell from "../components/PageShell";

const tickets = [
  { id: "#TKT-201", subject: "Payment issue", user: "john@example.com", status: "Open", priority: "High" },
  { id: "#TKT-200", subject: "Course access problem", user: "jane@example.com", status: "Resolved", priority: "Medium" },
];

export default function SupportTickets() {
  return (
    <PageShell title="Support Tickets" breadcrumbs={["Dashboard", "Support Tickets"]}>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-medium">Ticket</th>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4 font-medium text-slate-800">{ticket.id}</td>
                <td className="px-5 py-4 text-slate-600">{ticket.subject}</td>
                <td className="px-5 py-4 text-slate-600">{ticket.user}</td>
                <td className="px-5 py-4 text-slate-600">{ticket.priority}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ticket.status === "Open" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {ticket.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
