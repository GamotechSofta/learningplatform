import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { deleteUser, getUsers } from "../services/userService";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user?.role]);

  if (user?.role !== "admin") {
    return (
      <PageShell title="Users" breadcrumbs={["Dashboard", "Users"]}>
        <p className="text-sm text-slate-500">Only admins can manage users.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Users" breadcrumbs={["Dashboard", "Users"]}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading users...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-5 py-4 text-slate-600">{item.email}</td>
                  <td className="px-5 py-4 capitalize text-slate-600">{item.role}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("Delete this user?")) return;
                        await deleteUser(item._id);
                        loadUsers();
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
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
