import PageShell from "../components/PageShell";

const roles = [
  { name: "Super Admin", permissions: "Full access to all features" },
  { name: "Admin", permissions: "Manage courses, users, and orders" },
  { name: "Instructor", permissions: "Create and manage own courses" },
  { name: "Student", permissions: "View and enroll in courses" },
];

export default function RolesPermissions() {
  return (
    <PageShell title="Roles & Permissions" breadcrumbs={["Dashboard", "Roles & Permissions"]}>
      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{role.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{role.permissions}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
