export default function PageShell({ action, children, description }) {
  return (
    <div>
      {action && <div className="mb-6 flex justify-end">{action}</div>}
      {description && (
        <p className="mb-6 text-sm text-slate-600">{description}</p>
      )}
      {children}
    </div>
  );
}
