export default function PageHeader({ title, breadcrumbs = [], action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="mb-1 text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb}>
                {index > 0 && <span className="mx-2">›</span>}
                <span className={index === breadcrumbs.length - 1 ? "text-slate-800" : ""}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
