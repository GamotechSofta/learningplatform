import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../services/userService";

export default function Instructors() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user?.role !== "admin") {
        setLoading(false);
        return;
      }
      try {
        const users = await getUsers();
        setInstructors(users.filter((u) => u.role === "instructor"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.role]);

  return (
    <PageShell title="Instructors" breadcrumbs={["Dashboard", "Instructors"]}>
      {user?.role !== "admin" ? (
        <p className="text-sm text-slate-500">Only admins can view instructors list.</p>
      ) : loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((item) => (
                <tr key={item._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-5 py-4 text-slate-600">{item.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
